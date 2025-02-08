class PrintResolver {
  /**
   * Executes the Print task.
   * @param {Object} params - Task parameters, including the message to print.
   * @param {Object} context - Shared state across the flow, e.g., counter and limit.
   * @returns {Promise<Object>} - Resolves with a `continue` flag to control flow execution.
   */
  exec({ message }, context) {
    return new Promise((resolve) => {
      if (!context.counter) context.counter = 0; // Ensure counter exists
      if (!context.limit) context.limit = Infinity; // Default limit if not provided

      context.counter++; // Increment counter
      const stop = context.counter >= context.limit; // Stop when limit is reached

      setTimeout(() => {
        console.log(`Print Task: ${message} | Counter: ${context.counter}`);
        resolve(stop ? {} : { continue: true }); // Stop if limit reached
      }, 1000);
    });
  }

  /**
   * Creates a Print task object for the flow.
   * @param {string} taskName - The unique name of the task.
   * @param {Array<string>} input - Required keys for the task.
   * @param {Array<string>} output - Provided keys for the task.
   * @param {string} message - The message to print.
   * @returns {Object} - Task object for flow configuration.
   */
  static createTask(taskName, input = [], output = [], message = 'Default Message') {
    if (output.length === 0) {
      throw new Error('Output array must include at least one key (e.g., [continue]).');
    }

    return {
      [taskName]: {
        requires: input, // Inputs required by this task
        provides: output, // Outputs provided by this task
        resolver: {
          name: 'Print', // Name of the resolver
          params: {
            message: { value: message }, // Static message to print
          },
          results: {
            continue: output[0], // Map the continue flag to the first output key
          },
        },
      },
    };
  }
}

module.exports = PrintResolver;
