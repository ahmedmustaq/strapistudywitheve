'use strict';

module.exports = ({ strapi }) => ({
  // Create a new task parameter
  async createTaskParam(data) {
    return await strapi.db.query('plugin::workflow.taskparam').create({ data });
  },

  // Get all task parameters
  async getAllTaskParams() {
    return await strapi.db.query('plugin::workflow.taskparam').findMany();
  },

  // Get a single task parameter by ID
  async getTaskParamById(id) {
    return await strapi.db.query('plugin::workflow.taskparam').findOne({ where: { id } });
  },

  // Update a task parameter by ID
  async updateTaskParam(id, data) {
    return await strapi.db.query('plugin::workflow.taskparam').update({ where: { id }, data });
  },

  // Delete a task parameter by ID
  async deleteTaskParam(id) {
    return await strapi.db.query('plugin::workflow.taskparam').delete({ where: { id } });
  },
});
