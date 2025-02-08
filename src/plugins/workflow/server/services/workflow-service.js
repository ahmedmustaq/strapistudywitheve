'use strict';

const Flowed = require('flowed'); // Using require for CommonJS
const { FlowManager} = Flowed;
const { PDFResolver,WebResolver,SetterResolver,RestResolver, PrintResolver, ChatGPTResolver,GeminiResolver,AssetResolver } = require('./resolvers/index.js'); // Ensure correct path and CommonJS compatibility

/**
 * Creates an isolated FlowManager instance with resolvers registered.
 * This ensures thread safety by avoiding shared global state.
 * @returns {Object} FlowManager instance with isolated resolvers.
 */
const resolvers = {
      Rest: RestResolver,
      Print: PrintResolver,
      ChatGPT: ChatGPTResolver,
      Gemini: GeminiResolver,
      Asset: AssetResolver,
      Set: SetterResolver,
      Web: WebResolver,
      PDF: PDFResolver
    };



module.exports = ({ strapi }) => ({
  // Execute a workflow
  async executeWorkflow(workflowId, data) {
    strapi.log.debug(`Workflow ID: ${workflowId}`);


    // Fetch the workflow by ID
    const workflow = await strapi.db.query('plugin::workflow.workflow').findOne({
      where: { id: workflowId },
      populate: {
        workflow_params: {},
        workflow_tasks: {
          populate: {
            workflow_task_params: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found.`);
    }

    strapi.log.debug(`Workflow Data: ${JSON.stringify(workflow, null, 2)}`);



    // Extract context and options from workflow_params
    let context = {};
    let options = {};

   // Use `input`, `output`, and `options` from `data`, initializing empty objects if missing
  const { input = {}, output = []} = data;

  workflow.workflow_params.forEach((param) => {
    if (param.source === 'Content') {
      Object.assign(context, param.value); // Merge into `context`
    } else if (param.source === 'Input') {
      Object.keys(param.value).forEach((key) => {
        // If `input[key]` already exists and is an object, merge instead of replacing
        if (typeof input[key] === 'object' && typeof param.value[key] === 'object') {
          input[key] = { ...input[key], ...param.value[key] }; // Deep merge objects
        } else if (Array.isArray(input[key]) && Array.isArray(param.value[key])) {
          input[key] = [...input[key], ...param.value[key]]; // Append to array
        } else {
          input[key] = param.value[key]; // Assign new value (primitives)
        }
      });
    } else if (param.source === 'Options') {
      Object.assign(options, param.value); // Merge into `options`
    }
  });


    // Sort tasks by their order and construct the flow
    const sortedTasks = workflow.workflow_tasks.sort((a, b) => a.order - b.order); // Sort tasks by order

    const flow = {
      tasks: sortedTasks.reduce((acc, task) => {
        acc[task.name] = task.config;
        return acc;
      }, {}),
    };

    // Debug logs for workflow execution details
    strapi.log.debug(`Flow Configuration: ${JSON.stringify(flow, null, 2)}`);
    strapi.log.debug(`Input Params: ${JSON.stringify(input, null, 2)}`);
    strapi.log.debug(`Context: ${JSON.stringify(context, null, 2)}`);
    strapi.log.debug(`Options: ${JSON.stringify(options, null, 2)}`);
    strapi.log.debug(`Output Keys: ${JSON.stringify(output, null, 2)}`);

    // Execute the workflow
    try {
      const result = await FlowManager.run(flow, input, output, resolvers, context, options);
      strapi.log.debug(`Workflow Execution Result: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      strapi.log.error(`Error executing workflow: ${error.message}`);
      throw error;
    }
  },

  // Create a new workflow
  async createWorkflow(data) {
    return await strapi.db.query('plugin::workflow.workflow').create({ data });
  },

  // Get all workflows
  async getAllWorkflows() {
    return await strapi.db.query('plugin::workflow.workflow').findMany();
  },

  // Get a single workflow by ID
  async getWorkflowById(id) {
    return await strapi.db.query('plugin::workflow.workflow').findOne({ where: { id } });
  },

  // Update a workflow by ID
  async updateWorkflow(id, data) {
    return await strapi.db.query('plugin::workflow.workflow').update({ where: { id }, data });
  },

  // Delete a workflow by ID
  async deleteWorkflow(id) {
    return await strapi.db.query('plugin::workflow.workflow').delete({ where: { id } });
  },
});
