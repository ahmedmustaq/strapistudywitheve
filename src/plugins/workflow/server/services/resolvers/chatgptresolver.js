const https = require('https');

class ChatGPTResolver {
  /**
   * Executes the ChatGPT API call with JSON schema enforcement.
   * If an assessment.questions array is provided, splits it into optimum batches,
   * sends separate requests, and combines the responses.
   *
   * @param {Object} params - An object where all fields are strings (e.g., studentWork, htmlContent, overallPrompt, assessment).
   * @param {string} params.apiKey - Your OpenAI API key.
   * @param {string} params.assessment - Assessment details that include a questions array.
   * @param {string} params.responseformat - Format to return.
   * @param {string} [params.model] - The model to use (default: "gpt-4o-mini").
   * @param {Object} context - Shared workflow context, including JSON schema in format.
   * @returns {Promise<Object>} - The API response, formatted strictly as per the provided JSON schema.
   */
  async exec(params, context) {
    strapi.log.debug('ChatGPTResolver params:', params);

    const { apiKey, model = 'gpt-4o-mini', responseformat, assessment } = params;
    // Remove keys that are not prompt content
    const promptFields = { ...params };
    delete promptFields.apiKey;
    delete promptFields.model;
    delete promptFields.responseformat;
    delete promptFields.assessment;
    
    // Construct a base prompt from the remaining fields
    let basePrompt = Object.entries(promptFields)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n\n");

    // If responseformat is provided, add JSON schema instructions
    if (responseformat && typeof responseformat === 'object') {
      const jsonSchema = JSON.stringify(responseformat, null, 2);
      basePrompt += `\n\nPlease provide the response as a valid JSON object strictly adhering to this schema:\n${jsonSchema}`;
    }

    // Batch the questions if assessment.questions is provided as an array
    let batches = [];
    if (assessment && assessment.questions && Array.isArray(assessment.questions)) {
      const questionsArray = assessment.questions;
      const batchSize = 20; // optimum batch size; adjust as needed
      for (let i = 0; i < questionsArray.length; i += batchSize) {
        const batch = questionsArray.slice(i, i + batchSize);
        // Convert the batch into a JSON string
        const formattedBatch = JSON.stringify(batch, null, 2);
        // Each batch prompt includes the base prompt plus the batch questions in JSON format.
        const batchPrompt = basePrompt + "\n\nAssessment Questions (JSON):\n" + formattedBatch;
        batches.push(batchPrompt);
      }
    } else {
      // If no assessment.questions provided, use the base prompt.
      batches.push(basePrompt);
    }

    // Function to call ChatGPT API for a given prompt
    const callChatGPT = (promptText) => {
      return new Promise((resolve, reject) => {
        const requestBody = JSON.stringify({
          model,
          messages: [
            {
              "role": "system",
              "content": "You are a study assistant that helps students analyze their study resources and generate exam questions. Your response is always in JSON format. You are a GCSE Examiner who marks the work. Do not autogenerate question numbers; use those provided in the assessment."
            },
            { "role": "user", "content": promptText }
          ],
          response_format: { type: "json_object" }
        });

        const options = {
          hostname: 'api.openai.com',
          port: 443,
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              strapi.log.debug('ChatGPT Response:', data);
              const chatGPTResponse = JSON.parse(data);
              if (chatGPTResponse.error) {
                reject(new Error(chatGPTResponse.error.message));
              } else {
                let result = chatGPTResponse.choices[0]?.message?.content || '';
                // Remove possible markdown code block markers
                result = result.replace(/^```json\n|\n```$/g, "").trim();
                // Parse the JSON result
                const parsed = JSON.parse(result);
                resolve({ result: parsed, usage: chatGPTResponse.usage });
              }
            } catch (error) {
              reject(new Error('Error parsing ChatGPT response: ' + error.message));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error('ChatGPT API request failed: ' + error.message));
        });

        req.write(requestBody);
        req.end();
      });
    };

    // Process each batch sequentially
    let combinedResponse = null;
    if (batches.length === 1) {
      // If only one batch, simply return its result.
      try {
        const response = await callChatGPT(batches[0]);
        combinedResponse = response.result;
      } catch (error) {
        strapi.log.error('Error processing batch:', error.message);
        throw new Error('ChatGPTResolver: Failed to process the batch.');
      }
    } else {
      // If multiple batches (assessment based), combine them.
      combinedResponse = { questions: [], final_score: 0, overall_feedback: "" };
      for (const batchPrompt of batches) {
        try {
          const response = await callChatGPT(batchPrompt);
          if (response.result.questions && Array.isArray(response.result.questions)) {
            combinedResponse.questions = combinedResponse.questions.concat(response.result.questions);
          }
          if (typeof response.result.final_score === 'number') {
            combinedResponse.final_score += response.result.final_score;
          }
          if (typeof response.result.overall_feedback === 'string') {
            combinedResponse.overall_feedback += response.result.overall_feedback + " ";
          }
        } catch (error) {
          strapi.log.error('Error processing batch:', error.message);
          throw new Error('ChatGPTResolver: Failed to process one or more batches.');
        }
      }
    }

    return { chatGPTResponse: combinedResponse };
  }

  /**
   * Validates a JSON object against a given JSON schema.
   * @param {Object} jsonObject - The JSON object to validate.
   * @param {Object} schema - The expected JSON schema.
   * @returns {boolean} - True if valid, false otherwise.
   */
  validateSchema(jsonObject, schema) {
    for (const key in schema) {
      if (!(key in jsonObject)) {
        console.error(`Missing key: ${key} in response`);
        return false;
      }
      if (typeof jsonObject[key] !== schema[key].type) {
        console.error(`Type mismatch for key: ${key}. Expected: ${schema[key].type}, Received: ${typeof jsonObject[key]}`);
        return false;
      }
    }
    return true;
  }
}

module.exports = ChatGPTResolver;
