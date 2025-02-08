'use strict';

module.exports = ({ strapi }) => ({
  // Create a new task
  async createTask(data) {
    return await strapi.db.query('plugin::workflow.task').create({ data });
  },

  // Get all tasks
  async getAllTasks() {
    return await strapi.db.query('plugin::workflow.task').findMany();
  },

  // Get a single task by ID
  async getTaskById(id) {
    return await strapi.db.query('plugin::workflow.task').findOne({ where: { id } });
  },

  // Update a task by ID
  async updateTask(id, data) {
    return await strapi.db.query('plugin::workflow.task').update({ where: { id }, data });
  },

  // Delete a task by ID
  async deleteTask(id) {
    return await strapi.db.query('plugin::workflow.task').delete({ where: { id } });
  },
});
