const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const mime = require('mime-types');
const pdf = require('html-pdf');

class AssetResolver {
  /**
   * Resolves multiple assets from Strapi (via assets.id) and downloads multiple remote files (via assetUrls.url).
   * If an assetUrl is an HTML page (determined by missing extension), it generates a PDF.
   * @param {Object} params - Parameters for the resolver.
   * @param {Array<{id: number, processor: string,type: string}>} [params.assets] - Array of assets from Strapi.
   * @param {Array<{url: string, processor: string}>} [params.assetUrls] - Array of remote assets.
   * @returns {Promise<{files: Array<{filePath: string, mimeType: string, type: string,processor: string}>>}>} - Returns an array of file objects.
   */
  async exec(params, context) {
    const { assets = [], assetUrls = [] } = params;

    if (!Array.isArray(assets) || !Array.isArray(assetUrls)) {
      throw new Error("AssetResolver: 'assets' and 'assetUrls' must be arrays.");
    }

    if (assets.length === 0 && assetUrls.length === 0) {
      throw new Error("AssetResolver: Either 'assets' or 'assetUrls' must be provided.");
    }

    try {
      const files = [];

      // Resolve assets from Strapi
      if (assets.length > 0) {
        if (typeof strapi === 'undefined') {
          throw new Error("AssetResolver: Strapi instance is not available.");
        }

        strapi.log.debug(`Fetching asset details from Strapi for asset IDs: ${assets.map(a => a.id).join(", ")}`);

        for (const asset of assets) {
          try {
            const file = await strapi.entityService.findOne("plugin::upload.file", asset.id, {});

            if (!file || !file.url) {
              console.warn(`AssetResolver: Asset not found for assetId: ${asset.id}`);
              continue;
            }

            // Resolve the Strapi public directory
            const strapiRootDir = path.resolve(strapi.dirs?.root || process.cwd());
            const strapiPublicDir = path.join(strapiRootDir, "public");

            const filePath = file.url.startsWith("/")
              ? path.join(strapiPublicDir, file.url)
              : file.url;

            const mimeType = file.mime || mime.lookup(filePath) || "application/octet-stream";

            strapi.log.debug(`Resolved asset from Strapi: filePath=${filePath}, mimeType=${mimeType}, processor=${asset.processor}`);
            files.push({ filePath, mimeType, processor: asset.processor,type: asset.type });
          } catch (error) {
            console.error(`AssetResolver: Failed to resolve assetId ${asset.id} - ${error.message}`);
          }
        }
      }

      // Process asset URLs
      if (assetUrls.length > 0) {
        strapi.log.debug(`Processing asset URLs: ${assetUrls.map(a => a.url).join(", ")}`);

        for (const asset of assetUrls) {
          try {
            const { url, processor } = asset;
            const extension = path.extname(url);
            let filePath;
            let mimeType;

            if (!extension) {
              // If no extension, assume it's an HTML page and generate a PDF
              strapi.log.debug(`Generating PDF for HTML page: ${url}`);
              const response = await axios.get(url);
              const html = response.data;

              const tempFileName = `html-${Date.now()}.pdf`;
              filePath = path.join(os.tmpdir(), tempFileName);

              await new Promise((resolve, reject) => {
                pdf.create(html).toFile(filePath, (err, res) => {
                  if (err) {
                    console.error(`AssetResolver: Failed to generate PDF from ${url} - ${err.message}`);
                    reject(err);
                  } else {
                    strapi.log.debug(`Generated PDF: ${res.filename}, processor=${processor}`);
                    files.push({ filePath: res.filename, mimeType: "application/pdf", processor });
                    resolve();
                  }
                });
              });
            } else {
              // If it has an extension, download as a file
              strapi.log.debug(`Downloading asset from: ${url}`);
              const tempFileName = `file-${Date.now()}${extension}`;
              filePath = path.join(os.tmpdir(), tempFileName);

              const response = await axios.get(url, { responseType: "arraybuffer" });
              fs.writeFileSync(filePath, Buffer.from(response.data));

              mimeType = mime.lookup(filePath) || "application/octet-stream";

              strapi.log.debug(`Downloaded asset: filePath=${filePath}, mimeType=${mimeType}, processor=${processor}`);
              files.push({ filePath, mimeType, processor });
            }
          } catch (error) {
            console.error(`AssetResolver: Failed to process assetUrl ${asset.url} - ${error.message}`);
          }
        }
      }

      return { files };
    } catch (error) {
      console.error(`AssetResolver: Error resolving assets - ${error.message}`);
      throw new Error(`AssetResolver: ${error.message}`);
    }
  }
}

module.exports = AssetResolver;
