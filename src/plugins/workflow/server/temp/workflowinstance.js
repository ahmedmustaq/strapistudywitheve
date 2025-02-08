module.exports = [
  {
    method 'POST',
    path 'workflowinstances',
    handler 'workflowinstance.create',
    config { policies [] },
  },
  {
    method 'GET',
    path 'workflowinstances',
    handler 'workflowinstance.find',
    config { policies [] },
  },
  {
    method 'GET',
    path 'workflowinstancesid',
    handler 'workflowinstance.findOne',
    config { policies [] },
  },
  {
    method 'PUT',
    path 'workflowinstancesid',
    handler 'workflowinstance.update',
    config { policies [] },
  },
  {
    method 'DELETE',
    path 'workflowinstancesid',
    handler 'workflowinstance.delete',
    config { policies [] },
  },
];
