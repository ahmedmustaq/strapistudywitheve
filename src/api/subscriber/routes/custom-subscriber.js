'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/subscribers/subscribe',
      handler: 'subscriber.subscribeStudent',
      config: { policies: [], middlewares: [] },
    },
    {
        method: 'POST',
        path: '/subscribers/mark',
        handler: 'subscriber.markpaper',
        config: { policies: [], middlewares: [] },
      },
    
  ],
};
