'use strict';

/**
 * assessment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::assessment.assessment');
