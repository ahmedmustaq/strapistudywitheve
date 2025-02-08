class SetterResolver {
  /**
   * Executes the Setter task.
   * @param {Object} params - Task parameters, containing key-value pairs.
   * @param {Object} context - Shared state across the flow.
   * @returns {Promise<Object>} - Resolves with the same `params` object.
   */
  exec(params, context) {
    return new Promise((resolve) => {
      console.log("Setter Task: Received Parameters =>", JSON.stringify(params, null, 2));
      resolve(params); // Return the same parameters
    });
  }
}

module.exports = SetterResolver;
