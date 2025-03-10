'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/ai-training-sessions/:id/mark',
      handler: 'ai-training-session.mark',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/ai-training-sessions/:id/genbank',
      handler: 'ai-training-session.generateBank',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/ai-training-sessions/:id/retake',
      handler: 'ai-training-session.retake',
      config: { policies: [], middlewares: [] },
    },
    
  ],
};
