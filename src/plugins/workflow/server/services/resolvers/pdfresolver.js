const { PDFExtract } = require('pdf.js-extract');
const fs = require('fs');

class PDFResolver {
  /**
   * Extracts text from PDF files.
   * @param {Object} params - Parameters for the resolver.
   * @param {Array<{filePath: string, mimeType: string, processor: string}>} params.files - Array of file objects.
   * @param {Object} context - Workflow context (optional).
   * @returns {Promise<Object>} - Extracted text content and metadata.
   */
  async exec(params) {
    console.log('Executing PDFResolver with params:', params);

    const { files = [] } = params;

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("PDFResolver: 'files' parameter must be a non-empty array.");
    }

    // Filter for only PDF files with the correct processor
    const pdfFiles = files.filter(file =>
      file.mimeType === "application/pdf" && file.processor === "pdfProcessor"
    );

    if (pdfFiles.length === 0) {
      console.log("PDFResolver: No valid PDF files found with processor 'pdfProcessor'.");
      return { content: "", meta: { pageCount: 0, processedFiles: [] } };
    }

    const pdfExtract = new PDFExtract();
    const options = {
      firstPage: 1,
      lastPage: 0, // Extract all pages
      verbosity: 1,
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    };

    let allText = "";
    let totalPages = 0;
    let processedFiles = [];

    for (const file of pdfFiles) {
      const { filePath } = file;

      if (!fs.existsSync(filePath)) {
        console.warn(`PDFResolver: Skipping missing file: '${filePath}'`);
        continue;
      }

      try {
        console.log(`Processing PDF file: ${filePath}`);
        const data = await pdfExtract.extract(filePath, options);
        console.log(`Data: ${data}`);
        const extractedText = data.pages
          .map((page) => page.content.map((item) => item.str).join(' '))
          .join('\n');
          console.log(`extractedText: ${extractedText}`);
        allText += extractedText + "\n\n"; // Append extracted text with spacing
        totalPages += data.pages.length;
        processedFiles.push(filePath);
      } catch (error) {
        console.error(`PDFResolver: Failed to extract PDF '${filePath}':`, error.message);
      }
    }

    return {
      content: allText.trim(),
      meta: {
        pageCount: totalPages,
        processedFiles: processedFiles,
      },
    };
  }
}

module.exports = PDFResolver;
