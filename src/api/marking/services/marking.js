'use strict';

/**
 * marking service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::marking.marking');
