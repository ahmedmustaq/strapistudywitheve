'use strict';

const workflowService = require('./workflow-service');
const workflowinstanceService = require('./workflowinstance');
const taskService = require('./task');
const taskeventService = require('./taskevent');
const taskparamService = require('./taskparam');

module.exports = {
  workflowService,
  workflowinstanceService,
  taskService,
  taskeventService,
  taskparamService
};
