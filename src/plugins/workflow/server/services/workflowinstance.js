'use strict';

module.exports = ({ strapi }) => ({
  // Create a new workflow instance
  async createWorkflowInstance(data) {
    return await strapi.db.query('plugin::workflow.workflowinstance').create({ data });
  },

  // Get all workflow instances
  async getAllWorkflowInstances() {
    return await strapi.db.query('plugin::workflow.workflowinstance').findMany();
  },

  // Get a single workflow instance by ID
  async getWorkflowInstanceById(id) {
    return await strapi.db.query('plugin::workflow.workflowinstance').findOne({ where: { id } });
  },

  // Update a workflow instance by ID
  async updateWorkflowInstance(id, data) {
    return await strapi.db.query('plugin::workflow.workflowinstance').update({ where: { id }, data });
  },

  // Delete a workflow instance by ID
  async deleteWorkflowInstance(id) {
    return await strapi.db.query('plugin::workflow.workflowinstance').delete({ where: { id } });
  },
});
