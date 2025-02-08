module.exports = [
  {
    method: 'POST',
    path: '/taskevents',
    handler: 'taskevent.create',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskevents',
    handler: 'taskevent.find',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/taskevents/:id',
    handler: 'taskevent.findOne',
    config: { policies: [] },
  },
  {
    method: 'PUT',
    path: '/taskevents/:id',
    handler: 'taskevent.update',
    config: { policies: [] },
  },
  {
    method: 'DELETE',
    path: '/taskevents/:id',
    handler: 'taskevent.delete',
    config: { policies: [] },
  },
];
