'use strict';

module.exports = ({ strapi }) => ({
  // Create a new task parameter
  async create(ctx) {
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('taskparamService').createTaskParam(data);
    ctx.body = result;
  },

  // Retrieve all task parameters
  async find(ctx) {
    const results = await strapi.plugin('workflow').service('taskparamService').getAllTaskParams();
    ctx.body = results;
  },

  // Retrieve a single task parameter by ID
  async findOne(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('taskparamService').getTaskParamById(id);
    ctx.body = result || { message: 'Task parameter not found' };
  },

  // Update a task parameter by ID
  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await strapi.plugin('workflow').service('taskparamService').updateTaskParam(id, data);
    ctx.body = result || { message: 'Task parameter not found or not updated' };
  },

  // Delete a task parameter by ID
  async delete(ctx) {
    const { id } = ctx.params;
    const result = await strapi.plugin('workflow').service('taskparamService').deleteTaskParam(id);
    ctx.body = result || { message: 'Task parameter not found or not deleted' };
  },
});
