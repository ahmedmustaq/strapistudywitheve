const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiResolver {
  /**
   * Executes the Gemini API request.
   * @param {Object} params - Parameters for the resolver.
   * @param {string} params.prompt - Mandatory prompt for generating content.
   * @param {string} params.apiKey - Mandatory API key for the Gemini API.
   * @param {Array<{filePath: string, mimeType: string, processor: string}>} [params.files] - Optional array of file objects.
   * @param {Object} [params.format] - Optional JSON schema format for response validation.
   * @returns {Promise<Object>} - The Gemini API response, formatted as JSON if `params.format` is provided.
   */
  async exec(params, context) {
    const { prompt, apiKey, files = [], format } = params;

    if (!prompt) {
      throw new Error("GeminiResolver: 'prompt' parameter is mandatory.");
    }

    if (!apiKey) {
      throw new Error("GeminiResolver: 'apiKey' parameter is mandatory.");
    }

    strapi.log.debug("Executing GeminiResolver with params:", { prompt, files, format });

    // Initialize the Google Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let requestParts = [{ text: prompt }];

    // Process only files with `processor: "gemini"`
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

    // If format is provided, instruct Gemini to return JSON matching the schema
    if (format) {
      const schemaString = JSON.stringify(format, null, 2);
      requestParts[0].text += `\n\nPlease format the response as a valid JSON object following this schema:\n${schemaString}`;
    }

    try {
      const result = await model.generateContent(requestParts);

      // Extract text content from Gemini response
      const textResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      strapi.log.debug("Gemini API raw response:", textResponse);

      // Remove possible markdown code block (e.g., ```json\n ... \n```)
      const cleanText = textResponse.replace(/^```json\n|\n```$/g, "").trim();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanText);
      } catch (error) {
        console.error("Failed to parse response as JSON:", error.message);
        throw new Error("GeminiResolver: Response is not valid JSON.");
      }

      // Validate response against schema if format is provided
      // if (format && !this.validateSchema(parsedResponse, format)) {
      //   throw new Error("GeminiResolver: Response does not conform to the required JSON schema.");
      // }

      return { geminiResponse: parsedResponse };
    } catch (error) {
      console.error("GeminiResolver: Failed to analyze content:", error.message);
      throw new Error("GeminiResolver: Failed to analyze content.");
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
        console.error(`Type mismatch for key: ${key}. Expected: ${schema[key].type}, Received: ${typeof jsonObject[key]}`);
        return false;
      }
    }
    return true;
  }
}

module.exports = GeminiResolver;
