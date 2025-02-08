'use strict';

module.exports = ({ strapi }) => ({
  // Create a new workflow instance
  async create(ctx) {
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('workflowinstanceService').createWorkflowInstance(data);
    ctx.body = result;
  },

  // Retrieve all workflow instances
  async find(ctx) {
    const results = await strapi.plugin('workflow').service('workflowinstanceService').getAllWorkflowInstances();
    ctx.body = results;
  },

  // Retrieve a single workflow instance by ID
  async findOne(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('workflowinstanceService').getWorkflowInstanceById(id);
    ctx.body = result || { message: 'Workflow instance not found' };
  },

  // Update a workflow instance by ID
  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('workflowinstanceService').updateWorkflowInstance(id, data);
    ctx.body = result || { message: 'Workflow instance not found or not updated' };
  },

  // Delete a workflow instance by ID
  async delete(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('workflowinstanceService').deleteWorkflowInstance(id);
    ctx.body = result || { message: 'Workflow instance not found or not deleted' };
  },
});
