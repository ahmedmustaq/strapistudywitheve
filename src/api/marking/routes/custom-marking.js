'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/markings/:id/mark',
      handler: 'marking.markPaper',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/markings/:id/genbank',
      handler: 'marking.generateBank',
      config: { policies: [], middlewares: [] },
    },
    
  ],
};
