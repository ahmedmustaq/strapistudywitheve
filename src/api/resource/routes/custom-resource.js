'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/resources/:id/analyze',
      handler: 'resource.analyzeResource',
      config: { policies: [], middlewares: [] },
    },
    
  ],
};
