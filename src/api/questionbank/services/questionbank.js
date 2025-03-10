'use strict';

/**
 * questionbank service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::questionbank.questionbank');
