module.exports = [
  {
    method: 'POST',
    path: '/tasks',
    handler: 'task.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/tasks',
    handler: 'task.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/tasks/:id',
    handler: 'task.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/tasks/:id',
    handler: 'task.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/tasks/:id',
    handler: 'task.delete',
    config: { policies: [] },
  },
];
