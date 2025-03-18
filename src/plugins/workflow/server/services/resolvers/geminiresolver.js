const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiResolver {
  /**
   * Executes the Gemini API request.
   * @param {Object} params - Parameters for the resolver.
   * @param {string} params.prompt - Mandatory prompt for generating answersheet content.
   * @param {string} params.markschemeprompt - Mandatory prompt for generating markscheme content.
   * @param {string} params.apiKey - Mandatory API key for the Gemini API.
   * @param {string} params.format - Response format for the answersheet (e.g., "gemini_marking_response_format").
   * @param {string} params.markschemeformat - Response format for the markscheme (e.g., "gemini_marking_scheme_response_format").
   * @param {Array<{filePath: string, mimeType: string, processor: string, type?: string}>} [params.files] - Optional array of file objects.
   * @returns {Promise<Object>} - The Gemini API response.
   */
  async exec(params, context) {
    const { prompt, markschemeprompt, apiKey, files = [], format, markschemeformat } = params;

    if (!prompt) {
      throw new Error("GeminiResolver: 'prompt' parameter is mandatory.");
    }
   
    if (!apiKey) {
      throw new Error("GeminiResolver: 'apiKey' parameter is mandatory.");
    }

    strapi.log.debug("Executing GeminiResolver with params:", { prompt, markschemeprompt, files, format, markschemeformat });

    // Initialize the Google Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get the single answersheet and markscheme files (if provided)
    const answersheetFile = files.find(file => file.processor === "gemini" && file.type === "answersheet");
    const markschemeFile = files.find(file => file.processor === "gemini" && file.type === "markingscheme");

    // If file types are provided, use the new two-request logic with dynamic prompts.
    if (answersheetFile || markschemeFile) {
      let answersheetResponse = {};
      let markschemeResponse = {};

      // Process the answersheet file using the provided 'prompt' and 'format'
      if (answersheetFile) {
        let requestParts = [
          {
            text:
              prompt +
              `\n\nPlease format the response as a valid JSON object following this schema:\n${JSON.stringify(
                format,
                null,
                2
              )}`
          }
        ];

        const { filePath, mimeType } = answersheetFile;
        if (!filePath || !mimeType) {
          console.warn("GeminiResolver: Answersheet file missing filePath or mimeType.", answersheetFile);
        } else {
          try {
            strapi.log.debug(`Processing answersheet file: ${filePath}`);
            const fileData = fs.readFileSync(filePath);
            requestParts.push({
              inlineData: {
                data: fileData.toString("base64"),
                mimeType: mimeType
              }
            });
            strapi.log.debug("Answersheet file successfully converted to Base64.");
          } catch (error) {
            console.error(`GeminiResolver: Failed to process answersheet file ${filePath}:`, error.message);
            throw new Error(`GeminiResolver: Failed to process answersheet file ${filePath}.`);
          }
        }

        try {
          const result = await model.generateContent(requestParts);
          const textResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          strapi.log.debug("Gemini API raw answersheet response:", textResponse);
          const cleanText = textResponse.replace(/^```json\n|\n```$/g, "").trim();
          answersheetResponse = JSON.parse(cleanText);
        } catch (error) {
          console.error("GeminiResolver: Failed to analyze answersheet content:", error.message);
          throw new Error("GeminiResolver: Failed to analyze answersheet content.");
        }
      }

      // Process the markscheme file using the provided 'markschemeprompt' and 'markschemeformat'
      if (markschemeFile) {
        let requestParts = [
          {
            text:
              markschemeprompt +
              `\n\nPlease format the response as a valid JSON object following this schema:\n${JSON.stringify(
                markschemeformat,
                null,
                2
              )}`
          }
        ];

        const { filePath, mimeType } = markschemeFile;
        if (!filePath || !mimeType) {
          console.warn("GeminiResolver: Markscheme file missing filePath or mimeType.", markschemeFile);
        } else {
          try {
            strapi.log.debug(`Processing markscheme file: ${filePath}`);
            const fileData = fs.readFileSync(filePath);
            requestParts.push({
              inlineData: {
                data: fileData.toString("base64"),
                mimeType: mimeType
              }
            });
            strapi.log.debug("Markscheme file successfully converted to Base64.");
          } catch (error) {
            console.error(`GeminiResolver: Failed to process markscheme file ${filePath}:`, error.message);
            throw new Error(`GeminiResolver: Failed to process markscheme file ${filePath}.`);
          }
        }

        try {
          const result = await model.generateContent(requestParts);
          const textResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          strapi.log.debug("Gemini API raw markscheme response:", textResponse);
          const cleanText = textResponse.replace(/^```json\n|\n```$/g, "").trim();
          markschemeResponse = JSON.parse(cleanText);
        } catch (error) {
          console.error("GeminiResolver: Failed to analyze markscheme content:", error.message);
          throw new Error("GeminiResolver: Failed to analyze markscheme content.");
        }
      }

      // Merge the two responses by matching question_number.
      // Expected structure:
      // answersheetResponse: { gemini_marking_response_format: { questions: [ ... ] } }
      // markschemeResponse: { gemini_marking_scheme_response_format: { questions: [ ... ] } }
      let mergedQuestions = [];
      if (
        answersheetResponse.questions 
      ) {
        mergedQuestions = answersheetResponse.questions.map(ansQuestion => {
          let markingCriteria = "";
          if (
            markschemeResponse.questions 
          ) {
            const match = markschemeResponse.questions.find(
              q => String(q.question_number) === String(ansQuestion.question_number)
            );
            markingCriteria = match ? match.marking_criteria : "";
          }
          return { ...ansQuestion, marking_criteria: markingCriteria };
        });
      }

      return { geminiResponse: { questions: mergedQuestions } };
    } else {
      // Old logic: Process all files with processor "gemini" (if any) along with the prompt.
      let requestParts = [{ text: prompt }];

      const geminiFiles = files.filter(file => file.processor === "gemini");
      if (geminiFiles.length > 0) {
        for (const file of geminiFiles) {
          const { filePath, mimeType } = file;
          if (!filePath || !mimeType) {
            console.warn("GeminiResolver: Skipping file due to missing filePath or mimeType.", file);
            continue;
          }
          try {
            strapi.log.debug(`Processing file with Gemini: ${filePath}`);
            const fileData = fs.readFileSync(filePath);
            requestParts.push({
              inlineData: {
                data: fileData.toString("base64"),
                mimeType: mimeType,
              },
            });
            strapi.log.debug("File successfully converted to Base64.");
          } catch (error) {
            console.error(`GeminiResolver: Failed to process file ${filePath}:`, error.message);
            throw new Error(`GeminiResolver: Failed to process file ${filePath}.`);
          }
        }
      } else {
        strapi.log.debug("No files with processor 'gemini' found. Proceeding with prompt only.");
      }

      // If format is provided, instruct Gemini to return JSON matching the schema.
      if (format) {
        const schemaString = JSON.stringify(format, null, 2);
        requestParts[0].text += `\n\nPlease format the response as a valid JSON object following this schema:\n${schemaString}`;
      }

      try {
        const result = await model.generateContent(requestParts);
        const textResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        strapi.log.debug("Gemini API raw response:", textResponse);
        const cleanText = textResponse.replace(/^```json\n|\n```$/g, "").trim();
        let parsedResponse = JSON.parse(cleanText);
        return { geminiResponse: parsedResponse };
      } catch (error) {
        console.error("GeminiResolver: Failed to analyze content:", error.message);
        throw new Error("GeminiResolver: Failed to analyze content.");
      }
    }
  }

  /**
   * Validates a JSON object against a given schema.
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
        console.error(
          `Type mismatch for key: ${key}. Expected: ${schema[key].type}, Received: ${typeof jsonObject[key]}`
        );
        return false;
      }
    }
    return true;
  }
}

module.exports = GeminiResolver;
