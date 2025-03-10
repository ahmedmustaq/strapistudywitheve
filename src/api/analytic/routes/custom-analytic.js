'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/analytic/student',
      handler: 'analytic.getOverallAnalytics',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/analytic/dashboard',
      handler: 'analytic.getDashboardAnalytics',
      config: { policies: [], middlewares: [] },
    },
    
  ],
};