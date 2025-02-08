const https = require('https');

class ChatGPTResolver {
  /**
   * Executes the ChatGPT API call with JSON schema enforcement.
   * @param {Object} params - An object where all fields are strings (e.g., studentWork, htmlContent, overallPrompt).
   * @param {string} params.apiKey - Your OpenAI API key.
   * @param {string} [params.model] - The model to use (default: "gpt-3.5-turbo").
   * @param {Object} context - Shared workflow context, including JSON schema in format.
   * @returns {Promise<Object>} - The API response, formatted strictly as per the provided JSON schema.
   */
  async exec(params, context) {
    console.log('ChatGPTResolver params:', params);

    const { apiKey, model = 'gpt-3.5-turbo', ...promptFields } = params;

    if (!apiKey) {
      throw new Error("Missing 'apiKey' parameter for ChatGPT invocation.");
    }

    if (Object.keys(promptFields).length === 0) {
      throw new Error("No valid fields found in 'params' to use as prompts.");
    }

    // Convert object values into an array and join into a single prompt
    let finalPrompt = Object.entries(promptFields)
      .map(([key, value]) => `${key}: ${value}`) // Format each key-value pair as "key: value"
      .join("\n\n");

    // Enforce JSON schema format if provided
    if (context && context.format && typeof context.format === 'object') {
      const jsonSchema = JSON.stringify(context.format, null, 2);
      finalPrompt += `\n\nPlease provide the response as a valid JSON object strictly adhering to this schema:\n${jsonSchema}`;
    }

    console.log("Final Prompt Sent to ChatGPT:", finalPrompt);

    const requestBody = JSON.stringify({
      model,
      messages: [{ role: 'user', content: finalPrompt }],
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

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              let result = response.choices[0]?.message?.content || '';

              // Enforce JSON response if schema was provided
              if (context && context.format && typeof context.format === 'object') {
                try {
                  result = JSON.parse(result); // Convert response to JSON
                } catch (e) {
                  reject(new Error('ChatGPT response is not valid JSON. Ensure it matches the schema.'));
                  return;
                }

                // Validate response structure against the provided JSON schema
                if (!this.validateSchema(result, context.format)) {
                  reject(new Error('ChatGPT response does not conform to the required JSON schema.'));
                  return;
                }
              }

              resolve({
                response: result,
                usage: response.usage,
              });
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
