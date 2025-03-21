const https = require('https');

class ChatBatchGPTResolver {
  /**
   * Executes the ChatGPT API call with JSON schema enforcement.
   * If batch.questions is provided, splits it into optimum batches,
   * sends separate requests, and combines the responses.
   *
   * On each batch:
   *   1) Call ChatGPT with that batch.
   *   2) Compare the question_number in the response to the batch's question_number.
   *   3) Retry the missing subset up to `MAX_BATCH_RETRIES`.
   * After all batches, if any are still missing, re-chunk them and attempt again,
   * up to `MAX_GLOBAL_PASSES` times.
   *
   * @param {Object} params
   * @param {string} params.apiKey - Your OpenAI API key.
   * @param {string} [params.model] - The model to use (default: "gpt-4o-mini").
   * @param {Object} params.batch - Contains a questions array.
   * @param {Object|boolean} [params.responseformat] - JSON schema if needed.
   * @param {Object} context - Shared workflow context, including JSON schema in format.
   * @returns {Promise<Object>} - The final response, plus the total processing time in ms.
   */
  async exec(params, context) {
    // Start measuring time
    const startTime = Date.now();

    strapi.log.debug('ChatBatchGPTResolver params:', params);

    const {
      apiKey,
      model = 'gpt-4o-mini',
      responseformat,
      batch
    } = params;

    // Remove non-prompt fields
    const promptFields = { ...params };
    delete promptFields.apiKey;
    delete promptFields.model;
    delete promptFields.responseformat;
    delete promptFields.batch;

    // Build the base prompt from the remaining fields
    let basePrompt = Object.entries(promptFields)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n\n");

    // If responseformat is provided, add JSON schema instructions
    if (responseformat && typeof responseformat === 'object') {
      const jsonSchema = JSON.stringify(responseformat, null, 2);
      basePrompt += `\n\nPlease provide the response as a valid JSON object strictly adhering to this schema:\n${jsonSchema}`;
    }

    // All original questions
    const allQuestions = (batch && Array.isArray(batch.questions))
      ? batch.questions
      : [];

    // Prepare a top-level object to hold final results
    let combinedResponse = {
      questions: [],
      final_score: 0,
      overall_feedback: ""
    };

    // ==============================
    //  1) Helper to call ChatGPT
    // ==============================
    const callChatGPT = (promptText) => {
      return new Promise((resolve, reject) => {
        const requestBody = JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `
                You are a strict GCSE Examiner who marks the answers, make sure you cross check more thoroughly and let student know the areas of improvement
                Do not autogenerate question numbers; use those provided in the batch. Answer all questions in the batch, do not skip any`
            },
            { role: "user", content: promptText }
          ],
          // If you rely on a special format param, keep it here:
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
                // Strip ```json ... ```
                result = result.replace(/^```json\n?|```$/g, "").trim();
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

    // ==================================================
    //  2) Process a single array of questions with retry
    // ==================================================
    const MAX_BATCH_RETRIES = 3;

    const processSingleBatch = async (questionsForThisBatch) => {
      // We'll store all answered from this batch in a local aggregator
      let localAnswered = [];
      // The subset not answered yet
      let missing = [...questionsForThisBatch];

      let attempts = 0;
      while (missing.length > 0 && attempts < MAX_BATCH_RETRIES) {
        attempts++;
        // Construct prompt for the missing subset
        const formattedMissing = JSON.stringify(missing, null, 2);
        const promptText = basePrompt + `\n\nBATCH Questions (JSON):\n${formattedMissing}`;

        // Call ChatGPT
        let batchResult;
        try {
          const { result } = await callChatGPT(promptText);
          batchResult = result;
        } catch (err) {
          // If we can't call or parse ChatGPT, break or throw
          strapi.log.error(`Error in batch attempt #${attempts}:`, err.message);
          break;
        }

        // If ChatGPT returned questions, see which ones are answered
        const answered = Array.isArray(batchResult.questions)
          ? batchResult.questions
          : [];

        // Add them to localAnswered aggregator
        localAnswered.push(...answered);

        // Mark which question_number we got back
        const answeredNums = answered.map(q => q.question_number);
        // Filter out the newly answered from missing
        missing = missing.filter(m => !answeredNums.includes(m.question_number));

    

      }

      // Return { answered in this batch, leftover missing after N tries }
      return {
        answered: localAnswered,
        leftover: missing
      };
    };

    // ===========================================
    //  3) Reusable function to process an array
    //     of questions in 10-item sub-batches
    // ===========================================
    const processQuestionArrayInBatches = async (questions) => {
      const batchSize = 5;
      let leftoverAll = [];
      let answeredAll = [];

      for (let i = 0; i < questions.length; i += batchSize) {
        const chunk = questions.slice(i, i + batchSize);
        const { answered, leftover } = await processSingleBatch(chunk);
        answeredAll.push(...answered);
        leftoverAll.push(...leftover);
      }

      return {
        answered: answeredAll,
        leftover: leftoverAll
      };
    };

    // ====================================
    //  4) Overall "passes" to handle leftover
    // ====================================
    const MAX_GLOBAL_PASSES = 3;
    let pass = 0;

    // Initially, we want to process all the original questions
    let leftoverQuestions = [...allQuestions];
    let answeredSoFar = [];

    // We'll keep re-chunking leftover questions until done or max passes
    while (leftoverQuestions.length > 0 && pass < MAX_GLOBAL_PASSES) {
      pass++;
      strapi.log.debug(`Global pass #${pass}. Leftover so far: ${leftoverQuestions.length}`);

      // Process the leftover in 10-question sub-batches, each with retries
      const { answered, leftover } = await processQuestionArrayInBatches(leftoverQuestions);

      // Merge answered into global aggregator
      answeredSoFar.push(...answered);

      // leftover will be the questions still missing after this pass
      leftoverQuestions = leftover;
    }

    // Now answeredSoFar has everything that was answered
    // leftoverQuestions has any final missing after MAX_GLOBAL_PASSES
    combinedResponse.questions = answeredSoFar;

    if (leftoverQuestions.length > 0) {
      strapi.log.warn(`Still missing ${leftoverQuestions.length} question(s) after ${MAX_GLOBAL_PASSES} global passes.`);
      // You can decide whether to throw an error or proceed with partial data
    }

    // Sort by question_number if desired
    combinedResponse.questions.sort((a, b) => {
      const aNum = Number(a.question_number) || 0;
      const bNum = Number(b.question_number) || 0;
      return aNum - bNum;
    });

      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //  AFTER sorting, attach the marking_criteria from the original batch
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // (Here we assume that each 'original' question in allQuestions
    //  might have a `marking_criteria` we want to preserve.)
    if (Array.isArray(combinedResponse.questions) && Array.isArray(allQuestions)) {
      combinedResponse.questions = combinedResponse.questions.map(question => {
        const match = allQuestions.find(
          orig => String(orig.question_number) === String(question.question_number)
        );
        // If found, attach marking_criteria from the original question
        return {
          ...question,
          marking_criteria: match?.marking_criteria || question.marking_criteria || ""
        };
      });
    
      // Calculate the cumulative final score from marks_awarded in each question
      combinedResponse.final_score = combinedResponse.questions.reduce((total, question) => {
        return total + (question.marks_awarded || 0);
      }, 0);
    }

    // Measure end time
    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;

    return {
      chatGPTResponse: combinedResponse,
      processingTimeMs
    };
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

module.exports = ChatBatchGPTResolver;
