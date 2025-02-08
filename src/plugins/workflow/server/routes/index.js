module.exports = [
  // Workflow Routes
  {
    method: 'POST',
    path: '/workflows',
    handler: 'workflowController.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/workflows',
    handler: 'workflowController.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/workflows/:id',
    handler: 'workflowController.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/workflows/:id',
    handler: 'workflowController.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/workflows/:id',
    handler: 'workflowController.delete',
    config: { policies: [] },
  },
  {
    method: 'POST',
    path: '/workflows/:id/execute',
    handler: 'workflowController.execute',
    config: {
       policies: [], // Specify policies for access control
       auth: false,  // If authentication is required, use `true` (optional)
     },
  },

  // Task Routes
  {
    method: 'POST',
    path: '/tasks',
    handler: 'taskController.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/tasks',
    handler: 'taskController.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/tasks/:id',
    handler: 'taskController.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/tasks/:id',
    handler: 'taskController.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/tasks/:id',
    handler: 'taskController.delete',
    config: { policies: [] },
  },

  // TaskParam Routes
  {
    method: 'POST',
    path: '/taskparams',
    handler: 'taskparamController.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskparams',
    handler: 'taskparamController.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskparams/:id',
    handler: 'taskparamController.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/taskparams/:id',
    handler: 'taskparamController.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/taskparams/:id',
    handler: 'taskparamController.delete',
    config: { policies: [] },
  },

  // TaskEvent Routes
  {
    method: 'POST',
    path: '/taskevents',
    handler: 'taskeventController.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskevents',
    handler: 'taskeventController.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskevents/:id',
    handler: 'taskeventController.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/taskevents/:id',
    handler: 'taskeventController.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/taskevents/:id',
    handler: 'taskeventController.delete',
    config: { policies: [] },
  },

  // WorkflowInstance Routes
  {
    method: 'POST',
    path: '/workflowinstances',
    handler: 'workflowinstanceController.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/workflowinstances',
    handler: 'workflowinstanceController.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/workflowinstances/:id',
    handler: 'workflowinstanceController.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/workflowinstances/:id',
    handler: 'workflowinstanceController.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/workflowinstances/:id',
    handler: 'workflowinstanceController.delete',
    config: { policies: [] },
  },

];
