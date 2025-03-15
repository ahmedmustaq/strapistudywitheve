'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::student.student', ({ strapi }) => ({
 
  async findByUserId(ctx) {
    try {
      const { userId } = ctx.params;

      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      const student = await strapi.entityService.findMany('api::student.student', {
        filters: {
          user: {
            id: userId,
          },
        },
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
          studyprojects: {
            fields: ['id', 'name', 'code'],
          },
          academic_qualification: {
            fields: ['id', 'name', 'code'],
          },
          studyboard: {
            fields: ['id', 'boardName'],
          },
          gradelevel: {
            fields: ['id', 'gradeName'],
          },
          
        },
      });

      if (!student || student.length === 0) {
        return ctx.notFound('Student not found for the given User ID');
      }

      return ctx.send({
        message: 'Student fetched successfully by User ID',
        student: student[0], // Return the first match (since user ID should be unique)
      });
    } catch (error) {
      console.error('Error fetching student by User ID:', error);
      return ctx.badRequest('Failed to fetch student by User ID', { error });
    }
  },

  // ✅ Find Students with Avatar and Subjects
  async find(ctx) {
    try {
      const { filters = {} } = ctx.query;
      const students = await strapi.entityService.findMany('api::student.student', {
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
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      return ctx.badRequest('Failed to fetch students', { error });
    }
  },

   // ✅ Register Student with JSON + Avatar Upload
   async registerStudent(ctx) {
   try {
     const { data } = ctx.request.body;
     const parsedData = JSON.parse(data || '{}');

     const { username, email, password, subjects } = parsedData;

     if (!username || !email || !password) {
       return ctx.badRequest('Username, email, and password are required');
     }

     // Check for unique username
     const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
       where: { username },
     });

     if (existingUser) {
       return ctx.badRequest('Username is already taken');
     }

     const avatarFile = ctx.request.files?.avatar;

     return await strapi.db.transaction(async (trx) => {
       try {
         // 1️⃣ Create User
         const user = await strapi.plugins['users-permissions'].services.user.add({
           username,
           email,
           password,
           role: 3, // Student role ID
           blocked: false,
           provider: 'local',
           userType: 'Student',
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

         // 3️⃣ Create Student Entry
         const student = await strapi.entityService.create('api::student.student', {
           data: {
             user: user.id,
             subjects,
           },
           transacting: trx,
         });

         // 4️⃣ Fetch Updated Student
         const updatedStudent = await strapi.entityService.findOne('api::student.student', student.id, {
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

         return ctx.send({ message: 'Student registered successfully', student: updatedStudent });
       } catch (error) {
         console.error('Error during student registration:', error);
         throw error;
       }
     });
   } catch (error) {
     console.error('Error in registerStudent:', error);
     ctx.badRequest('Failed to register student');
   }
 },



async update(ctx) {
  const { id } = ctx.params;

  try {
    const { data } = ctx.request.body;
    const parsedData = JSON.parse(data || '{}');

    const {
      access,
      subjects,
      name,
      email,
      academic_qualification,
      studyboard,
      gradelevel,
      bio,
      ...rest
    } = parsedData;

    return await strapi.db.transaction(async (trx) => {
      try {
        // Fetch the existing student
        const student = await strapi.entityService.findOne('api::student.student', id, {
          populate: ['user'],
          transacting: trx,
        });

        if (!student) throw new Error('Student not found');

        // ✅ Update User Details (if name or email changed)
        if (name || email) {
          await strapi.query('plugin::users-permissions.user').update({
            where: { id: student.user.id },
            data: {
              username: name || student.user.username,
              email: email || student.user.email,
              blocked: access === false,
            },
            transacting: trx,
          });
        }

        // ✅ Prepare Update Payload
        const updatedData = {
          subjects: Array.isArray(subjects) ? subjects : undefined,
          academic_qualification: academic_qualification || undefined,
          studyboard: studyboard || undefined,
          gradelevel: gradelevel || undefined,
          bio: bio || undefined,
          ...rest,
        };

        // Remove undefined keys to avoid overwriting existing data
        const cleanedData = Object.fromEntries(
          Object.entries(updatedData).filter(([_, value]) => value !== undefined)
        );

        // ✅ Update Student Entity
        const updatedStudent = await strapi.entityService.update('api::student.student', id, {
          data: cleanedData,
          populate: {
            user: {
              fields: ['id', 'username', 'email', 'blocked'],
            },
            subjects: {
              fields: ['id', 'name', 'code'],
            },
            academic_qualification: {
              fields: ['id', 'name'],
            },
            studyboard: {
              fields: ['id', 'boardName'],
            },
            gradelevel: {
              fields: ['id', 'gradeName'],
            },
          },
          transacting: trx,
        });

        return ctx.send({ message: 'Student updated successfully', student: updatedStudent });
      } catch (error) {
        console.error('Error during student update:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error in updateStudent:', error);
    ctx.badRequest('Failed to update student');
  }
},

async updateAvatar(ctx) {
  const { id } = ctx.params; // User ID from the route

  try {
    const avatarFile = ctx.request.files?.avatar;

    if (!avatarFile) {
      return ctx.badRequest('Avatar file is required');
    }

    return await strapi.db.transaction(async (trx) => {
      try {
        // ✅ Fetch the user directly
        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: { id },
          populate: ['avatar'],
          transacting: trx,
        });

        if (!user) {
          throw new Error('User not found');
        }

        // ✅ Remove existing avatar if it exists
        if (user?.avatar?.id) {
          await strapi.plugin('upload').service('upload').remove({
            id: user.avatar.id,
          });
        }

        // ✅ Upload new avatar into 'avatars' folder
        const uploadedFiles = await strapi.plugin('upload').service('upload').upload({
          data: {
            refId: user.id,
            ref: 'plugin::users-permissions.user',
            field: 'avatar',
            folderPath: 'avatars', // Ensure the folder is correctly set
          },
          files: avatarFile,
        });

        // ✅ Retrieve the uploaded file's URL
        const uploadedAvatar = uploadedFiles?.[0];
        const avatarUrl = uploadedAvatar?.url || '';

        // ✅ Return updated avatar URL
        return ctx.send({
          message: 'Avatar updated successfully',
          avatarUrl,
        });
      } catch (error) {
        console.error('Error during avatar update:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error in updateAvatar:', error);
    ctx.badRequest('Failed to update avatar');
  }
},

  // ✅ Delete Student
  async delete(ctx) {
    const { id } = ctx.params;

    return await strapi.db.transaction(async (trx) => {
      try {
        const student = await strapi.entityService.findOne('api::student.student', id, {
          populate: {
            user: {
              fields: ['id'],
              populate: { avatar: { fields: ['id'] } },
            },
          },
          transacting: trx,
        });

        if (!student) throw new Error('Student not found');

        if (student.user?.avatar?.id) {
          await strapi.plugin('upload').service('upload').remove({
            id: student.user.avatar.id,
          });
        }

        await strapi.entityService.delete('api::student.student', id, { transacting: trx });

        await strapi.query('plugin::users-permissions.user').delete({
          where: { id: student.user.id },
          transacting: trx,
        });

        return ctx.send({ message: 'Student deleted successfully' });
      } catch (error) {
        console.error('Error during student deletion:', error);
        throw error;
      }
    });
  },
}));
