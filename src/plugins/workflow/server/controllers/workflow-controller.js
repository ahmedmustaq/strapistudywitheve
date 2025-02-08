'use strict';

module.exports = ({ strapi }) => ({
 
  async execute(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('workflowService').executeWorkflow(id,data);
    ctx.body = result;
  },
 
  // Create a new workflow
  async create(ctx) {
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('workflowService').createWorkflow(data);
    ctx.body = result;
  },

  // Retrieve all workflows
  async find(ctx) {
    const results = await strapi.plugin('workflow').service('workflowService').getAllWorkflows();
    ctx.body = results;
  },

  // Retrieve a single workflow by ID
  async findOne(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('workflowService').getWorkflowById(id);
    ctx.body = result || { message: 'Workflow not found' };
  },

  // Update a workflow by ID
  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('workflowService').updateWorkflow(id, data);
    ctx.body = result || { message: 'Workflow not found or not updated' };
  },

  // Delete a workflow by ID
  async delete(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('workflowService').deleteWorkflow(id);
    ctx.body = result || { message: 'Workflow not found or not deleted' };
  },
});
