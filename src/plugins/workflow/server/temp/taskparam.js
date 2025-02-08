module.exports = [
  {
    method: 'POST',
    path: '/taskparams',
    handler: 'taskparam.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskparams',
    handler: 'taskparam.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskparams/:id',
    handler: 'taskparam.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/taskparams/:id',
    handler: 'taskparam.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/taskparams/:id',
    handler: 'taskparam.delete',
    config: { policies: [] },
  },
];
