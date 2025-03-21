'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/notifications/:studentid',
      handler: 'notification.createOrUpdateNotification',
      config: { policies: [], middlewares: [] },
    },
    {
        method: 'GET',
        path: '/notifications/:studentid',
        handler: 'notification.getNotification',
        config: { policies: [], middlewares: [] },
      },
    
    
  ],
};
