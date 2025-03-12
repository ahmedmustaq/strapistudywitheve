'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/assessments/:id/loadtopics',
      handler: 'assessment.updateTopicTree',
      config: { policies: [], middlewares: [] },
    },
    {
        method: 'POST',
        path: '/assessments/:assessmentId/upload-topics',
        handler: 'assessment.uploadTopicsFromCSV',
        config: { policies: [], middlewares: [] },
      },
    
    
  ],
};
