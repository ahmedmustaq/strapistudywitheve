'use strict';

module.exports = {
  routes: [
     {
      method: 'GET',
      path: '/tutors',
      handler: 'tutor.find',
      config: {
        policies: [],
        middlewares: [],
      },
    }, 
    {
      method: 'POST',
      path: '/tutors/register',
      handler: 'tutor.registerTutor',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tutors/:id',
      handler: 'tutor.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/tutors/:id',
      handler: 'tutor.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
