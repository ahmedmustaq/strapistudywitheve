'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::tutor.tutor', ({ strapi }) => ({

  // ✅ Find Tutors with Avatar (Now from User)
  async find(ctx) {
    try {
      const { filters = {} } = ctx.query;
      const tutors = await strapi.entityService.findMany('api::tutor.tutor', {
        filters,
        populate: {
          user: {
            fields: ['id', 'username', 'email', 'blocked', 'userType'],
            populate: {
              avatar: {
                fields: ['id', 'name', 'url', 'formats'],
              },
            },
          },
          subjects: {
            fields: ['id', 'name', 'code'],
          },
        },
      });
      return ctx.send({
        message: 'Tutors fetched successfully',
        tutors,
      });
    } catch (error) {
      console.error('Error fetching tutors:', error);
      return ctx.badRequest('Failed to fetch tutors', { error });
    }
  },

  // ✅ Register Tutor with JSON + Avatar Upload (Now under User)
  async registerTutor(ctx) {
    try {
      const { data } = ctx.request.body;
      const parsedData = JSON.parse(data || '{}');

      const { username, email, password, subjects } = parsedData;

      if (!username || !email || !password) {
        return ctx.badRequest('Username, email, and password are required');
      }

      // Extract avatar file if exists
      const avatarFile = ctx.request.files?.avatar;

      // Start transaction
      return await strapi.db.transaction(async (trx) => {
        try {
          // 1️⃣ Create User
          const user = await strapi.plugins['users-permissions'].services.user.add({
            username,
            email,
            password,
            role: 4, // Tutor role ID
            confirmed: true,
            blocked: false,
            provider: 'local',
            userType: 'Tutor',
          });

          // 2️⃣ Handle Avatar Upload (if provided)
          if (avatarFile) {
            await strapi.plugin('upload').service('upload').upload({
              data: {
                refId: user.id,
                ref: 'plugin::users-permissions.user',
                field: 'avatar',
              },
              files: avatarFile,
            });
          }

          // 3️⃣ Create Tutor
          const tutor = await strapi.entityService.create('api::tutor.tutor', {
            data: {
              user: user.id,
              subjects,
            },
            transacting: trx,
          });

          // 4️⃣ Fetch Updated Tutor with User Avatar
          const updatedTutor = await strapi.entityService.findOne('api::tutor.tutor', tutor.id, {
            populate: {
              user: {
                fields: ['id', 'username', 'email'],
                populate: {
                  avatar: {
                    fields: ['id', 'name', 'url', 'formats'],
                  },
                },
              },
              subjects: {
                fields: ['id', 'name', 'code'],
              },
            },
            transacting: trx,
          });

          return ctx.send({ message: 'Tutor registered successfully', tutor: updatedTutor });
        } catch (error) {
          console.error('Error during tutor registration:', error);
          throw error; // Automatic rollback
        }
      });
    } catch (error) {
      console.error('Error in registerTutor:', error);
      ctx.badRequest('Failed to register tutor');
    }
  },

  // ✅ Update Tutor with JSON + Avatar Upload and Remove Previous Avatar (User)
  async update(ctx) {
    const { id } = ctx.params;

    try {
      const { data } = ctx.request.body;
      const parsedData = JSON.parse(data || '{}');

      const { access, subjects, name, email, ...rest } = parsedData;

      // Extract avatar file if exists
      const avatarFile = ctx.request.files?.avatar;

      return await strapi.db.transaction(async (trx) => {
        try {
          // 1️⃣ Find Tutor with User
          const tutor = await strapi.entityService.findOne('api::tutor.tutor', id, {
            populate: ['user.userType', 'user.avatar'],
            transacting: trx,
          });

          if (!tutor) throw new Error('Tutor not found');

          // 2️⃣ Update User (If `name` or `email` is provided)
          if (name || email) {
            await strapi.query('plugin::users-permissions.user').update({
              where: { id: tutor.user.id },
              data: {
                username: name || tutor.user.username,
                email: email || tutor.user.email,
                blocked: access === false,
              },
              transacting: trx,
            });
          }

          // 3️⃣ Handle Avatar Upload (Delete Previous if exists)
          if (avatarFile && tutor.user?.avatar?.id) {
            await strapi.plugin('upload').service('upload').remove({
              id: tutor.user.avatar.id,
            });
          }

          if (avatarFile) {
            await strapi.plugin('upload').service('upload').upload({
              data: {
                refId: tutor.user.id,
                ref: 'plugin::users-permissions.user',
                field: 'avatar',
              },
              files: avatarFile,
            });
          }

          // 4️⃣ Update Tutor Details
          const updatedTutor = await strapi.entityService.update('api::tutor.tutor', id, {
            data: { subjects, ...rest },
            populate: {
              user: {
                fields: ['id', 'username', 'email','blocked'],
                populate: {
                  avatar: {
                    fields: ['id', 'name', 'url', 'formats'],
                  },
                },
              },
              subjects: {
                fields: ['id', 'name', 'code'],
              },
            },
            transacting: trx,
          });

          return ctx.send({ message: 'Tutor updated successfully', tutor: updatedTutor });
        } catch (error) {
          console.error('Error during tutor update:', error);
          throw error; // Automatic rollback
        }
      });
    } catch (error) {
      console.error('Error in updateTutor:', error);
      ctx.badRequest('Failed to update tutor');
    }
  },

  // ✅ Delete Tutor and Avatar (User)
// ✅ Delete Tutor and User with Avatar Cleanup
  async delete(ctx) {
    const { id } = ctx.params;

    return await strapi.db.transaction(async (trx) => {
      try {
        // 1️⃣ Find Tutor with User and User's Avatar
        const tutor = await strapi.entityService.findOne('api::tutor.tutor', id, {
          populate: {
            user: {
              fields: ['id', 'username', 'email'],
              populate: {
                avatar: {
                  fields: ['id'],
                },
              },
            },
          },
          transacting: trx,
        });

        if (!tutor) throw new Error('Tutor not found');

        // 2️⃣ Delete Avatar (if exists on User)
        if (tutor.user?.avatar?.id) {
          await strapi.plugin('upload').service('upload').remove({
            id: tutor.user.avatar.id,
          });
        }

        // 3️⃣ Delete Tutor
        await strapi.entityService.delete('api::tutor.tutor', id, { transacting: trx });

        // 4️⃣ Delete User
        await strapi.query('plugin::users-permissions.user').delete({
          where: { id: tutor.user.id },
          transacting: trx,
        });

        return ctx.send({ message: 'Tutor and associated user deleted successfully' });
      } catch (error) {
        console.error('Error during tutor deletion:', error);
        throw error; // Automatic rollback
      }
    });
  }

}));
