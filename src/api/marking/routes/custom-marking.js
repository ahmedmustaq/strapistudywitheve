'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/markings/:id/mark',
      handler: 'marking.markPaper',
      config: { policies: [], middlewares: [] },
    },
    
  ],
};
