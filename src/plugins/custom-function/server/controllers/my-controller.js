'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('custom-function')
      .service('myService')
      .getWelcomeMessage();
  },
});
