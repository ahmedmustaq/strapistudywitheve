'use strict';

module.exports = ({ strapi }) => ({
  // Create a new task event
  async create(ctx) {
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('taskeventService').createTaskEvent(data);
    ctx.body = result;
  },

  // Retrieve all task events
  async find(ctx) {
    const results = await strapi.plugin('workflow').service('taskeventService').getAllTaskEvents();
    ctx.body = results;
  },

  // Retrieve a single task event by ID
  async findOne(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('taskeventService').getTaskEventById(id);
    ctx.body = result || { message: 'Task event not found' };
  },

  // Update a task event by ID
  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('taskeventService').updateTaskEvent(id, data);
    ctx.body = result || { message: 'Task event not found or not updated' };
  },

  // Delete a task event by ID
  async delete(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('taskeventService').deleteTaskEvent(id);
    ctx.body = result || { message: 'Task event not found or not deleted' };
  },
});
