import { PDFExtract } from 'pdf.js-extract';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

class VisionAPIResolver {
  /**
   * Executes the Google Vision API request.
   * Handles both images and PDFs with embedded images.
   * @param {Object} params - Parameters for the resolver.
   * @param {string} params.filePath - Path to the image or PDF file.
   * @param {string} params.type - Type of detection (e.g., "TEXT_DETECTION", "LABEL_DETECTION").
   * @param {string} params.apiKey - Your Google Vision API key.
   * @param {Object} context - Workflow context (optional).
   * @returns {Promise<Object>} - The Vision API response.
   */
  async exec(params) {
    strapi.log.debug('Executing VisionAPIResolver with params:', params);

    const { filePath, type, apiKey } = params;

    if (!filePath) {
      throw new Error("VisionAPIResolver: 'filePath' parameter is required.");
    }

    if (!type) {
      throw new Error("VisionAPIResolver: 'type' parameter is required.");
    }

    if (!apiKey) {
      throw new Error("VisionAPIResolver: 'apiKey' parameter is required.");
    }

    const isPdf = filePath.endsWith('.pdf');
    if (isPdf) {
      return this.processPdf(filePath, type, apiKey);
    } else {
      return this.processImage(filePath, type, apiKey);
    }
  }

  /**
   * Processes a single image file and makes a Vision API call.
   * @param {string} filePath - Path to the image file.
   * @param {string} type - Type of detection (e.g., "TEXT_DETECTION").
   * @param {string} apiKey - Google Vision API key.
   * @returns {Promise<Object>} - The Vision API response.
   */
  async processImage(filePath, type, apiKey) {
    strapi.log.debug(`Processing image: ${filePath}`);

    const isRemote = filePath.startsWith('http://') || filePath.startsWith('https://');
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    let requestPayload;

    if (isRemote) {
      // Remote image: Use imageUri
      requestPayload = {
        requests: [
          {
            image: { source: { imageUri: filePath } },
            features: [{ type }],
          },
        ],
      };
    } else {
      // Local image: Convert to Base64
      const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });
      requestPayload = {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type }],
          },
        ],
      };
    }

    // Make the Vision API call
    const response = await axios.post(endpoint, requestPayload);
    const data = response.data;

    // Extract results based on type
    let output;
    switch (type) {
      case 'TEXT_DETECTION':
        output = data.responses[0]?.textAnnotations?.[0]?.description || 'No text detected';
        break;
      case 'LABEL_DETECTION':
        output = data.responses[0]?.labelAnnotations?.map((label) => label.description) || [];
        break;
      case 'OBJECT_LOCALIZATION':
        output = data.responses[0]?.localizedObjectAnnotations?.map((obj) => obj.name) || [];
        break;
      default:
        output = data.responses[0] || {};
    }

    return {
      content: output,
      meta: { type },
    };
  }

  /**
   * Processes a PDF file to extract images and call Vision API on each image.
   * @param {string} filePath - Path to the PDF file.
   * @param {string} type - Type of detection (e.g., "TEXT_DETECTION").
   * @param {string} apiKey - Google Vision API key.
   * @returns {Promise<Object>} - The combined Vision API response.
   */
  async processPdf(filePath, type, apiKey) {
    strapi.log.debug(`Processing PDF: ${filePath}`);

    const pdfExtract = new PDFExtract();
    const options = {};
    const extractedImages = [];

    // Extract images from the PDF
    return new Promise((resolve, reject) => {
      pdfExtract.extract(filePath, options, async (err, data) => {
        if (err) {
          return reject(new Error(`VisionAPIResolver: Error extracting PDF: ${err.message}`));
        }

        // Collect all embedded images
        for (const page of data.pages) {
          for (const item of page.content) {
            if (item.image) {
              const tempFileName = `temp-image-${Date.now()}.jpg`;
              const tempFilePath = path.join(os.tmpdir(), tempFileName);
              fs.writeFileSync(tempFilePath, item.image);

              extractedImages.push(tempFilePath);
            }
          }
        }

        if (extractedImages.length === 0) {
          return reject(new Error('VisionAPIResolver: No images found in the PDF.'));
        }

        // Process each extracted image
        const results = [];
        for (const imagePath of extractedImages) {
          try {
            const result = await this.processImage(imagePath, type, apiKey);
            results.push(result);
            fs.unlinkSync(imagePath); // Clean up the temporary file
          } catch (error) {
            console.error(`Error processing image: ${imagePath}`, error.message);
          }
        }

        resolve(results);
      });
    });
  }
}

export default VisionAPIResolver;
