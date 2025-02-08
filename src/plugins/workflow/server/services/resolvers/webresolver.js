const { JSDOM } = require('jsdom');

class WebResolver {
  async exec(params, context) {
    console.log('WebExtractorResolver params:', params);

    const { url } = params;

    if (!url) {
      throw new Error("Missing 'url' parameter for WebExtractorResolver.");
    }

    try {
      const dom = await JSDOM.fromURL(url);
      const textContent = dom.window.document.body.textContent.trim();
      const dataLength = textContent.length; // Get length of extracted text

      console.log(`The extracted text from ${url} has length: ${dataLength} characters`);

      return {
        content: textContent,
        length: dataLength // Return the length as well
      };
    } catch (error) {
      throw new Error(`Error extracting content from URL: ${error.message}`);
    }
  }
}

module.exports = WebResolver;
