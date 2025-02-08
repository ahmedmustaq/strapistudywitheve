'use strict';

/**
 * examboard service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::examboard.examboard');
