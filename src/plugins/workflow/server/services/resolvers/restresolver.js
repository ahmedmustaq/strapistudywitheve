const http = require('http');
const https = require('https');

class RestResolver {
  /**
   * Executes the REST API call.
   */
  exec({ url, method = 'GET', headers = {}, body = null }, context) {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error("Missing 'url' parameter for REST invocation"));
        return;
      }

      const isHttps = url.startsWith('https://');
      const httpModule = isHttps ? https : http;

      const req = httpModule.request(
        url,
        { method, headers },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsedBody = data ? JSON.parse(data) : null;
              resolve({
                responseBody: parsedBody,
                statusCode: res.statusCode,
                continue: context.counter < context.limit, // Continue based on context
              });
            } catch (error) {
              resolve({
                responseBody: data,
                statusCode: res.statusCode,
                continue: context.counter < context.limit, // Continue based on context
              });
            }
          });
        }
      );

      req.on('error', (error) => {
        reject(new Error(`REST invocation failed: ${error.message}`));
      });

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * Creates a task object for the flow.
   */
  static createTask(taskName, input = [], output = [], params = {}) {
    const { url, method = 'GET', headers = {}, body = null } = params;

    // Ensure the output array has at least two elements for mapping
    if (output.length < 2) {
      throw new Error('Output array must have at least two keys (e.g., [responseBody, statusCode])');
    }

    return {
      [taskName]: {
        requires: input, // Inputs required by this task
        provides: output, // Outputs provided by this task
        resolver: {
          name: 'Rest', // Name of the resolver (ensure registered as 'Rest')
          params: {
            url: { value: url }, // Static URL
            method: { value: method }, // HTTP method
            headers: { value: headers }, // HTTP headers
            body: { value: body }, // HTTP body
          },
          results: {
            responseBody: output[0], // Map response body to the first output key
            statusCode: output[1], // Map status code to the second output key
          },
        },
      },
    };
  }
}

module.exports = RestResolver;
 