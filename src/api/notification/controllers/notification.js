'use strict';

/**
 * notification controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::notification.notification', ({ strapi }) => ({
  async getNotification(ctx) {
    const { studentid } = ctx.params;

    // Define the three notification types
    const notificationTypes = ['AITraining', 'Marking', 'Resource'];

    // Fetch all existing notifications for the student
    const existingNotifications = await strapi.db.query('api::notification.notification').findMany({
      where: { student: studentid },
      populate: ['student'],
    });

    // Create a map of existing notifications by type for easy lookup
    const existingNotificationsMap = existingNotifications.reduce((map, notification) => {
      map[notification.notificationtype] = notification;
      return map;
    }, {});

    // Ensure all three notification types exist for the student
    const notifications = notificationTypes.map((type) => {
      if (existingNotificationsMap[type]) {
        // If the notification exists, return it
        return existingNotificationsMap[type];
      } else {
        // If the notification doesn't exist, return a default structure
        return {
          type: null, // Default value for type
          frequency: null, // Default value for frequency
          notificationtype: type, // Set the notification type
          student: studentid, // Associate with the student
        };
      }
    });

    return { data: notifications };
  },

  async createOrUpdateNotification(ctx) {
    const { studentid } = ctx.params;
    const notificationsData = ctx.request.body; // Array of notification configurations

    if (!Array.isArray(notificationsData) || notificationsData.length !== 3) {
      return ctx.badRequest('Invalid request: Expected an array of 3 notification configurations.');
    }

    // Process each notification configuration
    const results = await Promise.all(
      notificationsData.map(async (notification) => {
        const { type, frequency, notificationtype } = notification;

        // Check if a notification already exists for the student and type
        const existingNotification = await strapi.db.query('api::notification.notification').findOne({
          where: { student: studentid, notificationtype },
        });

        if (existingNotification) {
          // Update the existing notification
          return await strapi.db.query('api::notification.notification').update({
            where: { id: existingNotification.id },
            data: {
              type,
              frequency,
            },
          });
        } else {
          // Create a new notification
          return await strapi.db.query('api::notification.notification').create({
            data: {
              type,
              frequency,
              notificationtype,
              student: studentid,
            },
          });
        }
      })
    );

    return { data: results };
  },
}));