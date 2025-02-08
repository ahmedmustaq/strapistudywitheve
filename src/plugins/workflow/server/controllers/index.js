'use strict';

const workflowController = require('./workflow-controller');
const workflowinstanceController = require('./workflowinstance');
const taskController = require('./task');
const taskeventController = require('./taskevent');
const taskparamController = require('./taskparam');

module.exports = {
  workflowController,
  workflowinstanceController,
  taskController,
  taskeventController,
  taskparamController
};
