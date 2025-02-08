'use strict';

module.exports = ({ strapi }) => ({
  // Create a new task
  async create(ctx) {
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('taskService').createTask(data);
    ctx.body = result;
  },

  // Retrieve all tasks
  async find(ctx) {
    const results = await strapi.plugin('workflow').service('taskService').getAllTasks();
    ctx.body = results;
  },

  // Retrieve a single task by ID
  async findOne(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('taskService').getTaskById(id);
    ctx.body = result || { message: 'Task not found' };
  },

  // Update a task by ID
  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('taskService').updateTask(id, data);
    ctx.body = result || { message: 'Task not found or not updated' };
  },

  // Delete a task by ID
  async delete(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('taskService').deleteTask(id);
    ctx.body = result || { message: 'Task not found or not deleted' };
  },
});
