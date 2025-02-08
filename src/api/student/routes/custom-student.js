'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/students',
      handler: 'student.find',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/students/register',
      handler: 'student.registerStudent',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/students/:id',
      handler: 'student.update',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/students/:id',
      handler: 'student.delete',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/students/user/:userId',
      handler: 'student.findByUserId',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/students/:id/avatar',
      handler: 'student.updateAvatar',
      config: { policies: [], middlewares: [] },
    },
  ],
};
