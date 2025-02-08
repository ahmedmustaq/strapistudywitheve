'use strict';

module.exports = ({ strapi }) => ({
  // Create a new task event
  async createTaskEvent(data) {
    return await strapi.db.query('plugin::workflow.taskevent').create({ data });
  },

  // Get all task events
  async getAllTaskEvents() {
    return await strapi.db.query('plugin::workflow.taskevent').findMany();
  },

  // Get a single task event by ID
  async getTaskEventById(id) {
    return await strapi.db.query('plugin::workflow.taskevent').findOne({ where: { id } });
  },

  // Update a task event by ID
  async updateTaskEvent(id, data) {
    return await strapi.db.query('plugin::workflow.taskevent').update({ where: { id }, data });
  },

  // Delete a task event by ID
  async deleteTaskEvent(id) {
    return await strapi.db.query('plugin::workflow.taskevent').delete({ where: { id } });
  },
});
