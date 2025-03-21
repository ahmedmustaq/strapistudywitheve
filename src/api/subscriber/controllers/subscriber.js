'use strict';

// Import the crypto module for generating random codes
const crypto = require('crypto');

/**
 * subscriber controller
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subscriber.subscriber', ({ strapi }) => ({
  async subscribeStudent(ctx) {
    try {
      const { data } = ctx.request.body;

      const { emailaddress } = data;

      // Validate email
      if (!emailaddress) {
        return ctx.badRequest('Email is required');
      }

      // Generate a random code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();

      // Save the code and email in a temporary table (e.g., student_subscriptions)
      await strapi.entityService.create('api::subscriber.subscriber', {
        data: {
          email: emailaddress,
          code,
          isVerified: false, // Mark as unverified until the code is confirmed
        },
      });

      // Send the code via email
      await strapi.plugin('email-designer').service('email').sendTemplatedEmail(
        {
          to: emailaddress,
        },
        {
          templateReferenceId: 3, // Use the new template for the code
          subject: `Your Verification Code for Studywitheve`,
        },
        {
          code, // Pass the code to the template
        }
      );

      return ctx.send({ message: 'Verification code sent to your email. Please check your inbox.' });
    } catch (error) {
      console.error('Error in subscribeStudent:', error);
      return ctx.badRequest('Failed to process subscription. Please try again later.');
    }
  },
  async markpaper(ctx) {
    try {
      const {
        code,
        examBoard,
        subject,
        specificationCode,
        paper,
        studentEmail,
        studentName,
        school, // Optional
        mobileNumber, // Optional
        assessmentName, // Optional
      } = ctx.request.body;

      // Validate required fields
      if (!paper || !code || !examBoard || !subject || !specificationCode || !studentEmail || !studentName) {
        return ctx.badRequest('All required fields must be provided');
      }

      // Verify the code
      const subscription = await strapi.entityService.findMany('api::subscriber.subscriber', {
        filters: { code, email: studentEmail, isVerified: false },
      });

      if (!subscription || subscription.length === 0) {
        return ctx.badRequest('Invalid or expired code');
      }

      // Mark the code as verified
      await strapi.entityService.update('api::subscriber.subscriber', subscription[0].id, {
        data: { isVerified: true },
      });

      // Register the student if not found
      let student = await strapi.entityService.findMany('api::student.student', {
        filters: {
          user: {
            email: studentEmail, // Filter by user.email
          },
        },
        populate: ['user'], // Populate the user relation to access user details
      });

      if (!student || student.length === 0) {
        student = await strapi.entityService.create('api::student.student', {
          data: {
            email: studentEmail,
            name: studentName,
            username: studentEmail, // Use email as username
            confirmed: false, // Mark as unconfirmed
            school,
            mobileNumber,
          },
        });
      } else {
        student = student[0];
      }

      // Look up the assessment
      const assessment = await strapi.entityService.findMany('api::assessment.assessment', {
        filters: { code: paper },
      });

      if (!assessment || assessment.length === 0) {
        return ctx.badRequest('Assessment not found');
      }

      // Create or find the project
      let project = await strapi.entityService.findMany('api::studyproject.studyproject', {
        filters: { student: student.id, name: `My First Project` },
      });

      if (!project || project.length === 0) {
        project = await strapi.entityService.create('api::studyproject.studyproject', {
          data: {
            name: `My First Project`,
            description: '"My First Project" is the starting point for students to organize their academic work. It helps track progress, manage tasks, and prepare for assessments, ai-training, providing a clear path to achieving academic goals',
            assessments: assessment[0].id,
            student: student.id,
          },
        });
      } else {
        project = project[0];
      }

      // Handle markingscheme (if provided)
      const markingschemeFile = ctx.request.files?.markingScheme;
      let markingschemeResourceId = null;
      let markingType = 'AutoMarking'; // Default to AutoMarking

      if (markingschemeFile) {
        // Look up the "markingscheme" resourcetype
        const markingschemeResourceType = await strapi.entityService.findMany('api::resourcetype.resourcetype', {
          filters: { code: 'markingscheme' }, // Assuming 'markingscheme' is the code for the resource type
        });

        if (!markingschemeResourceType || markingschemeResourceType.length === 0) {
          return ctx.badRequest('Markingscheme resource type not found');
        }

        // Create a resource entry for the markingscheme
        const markingschemeResource = await strapi.entityService.create('api::resource.resource', {
          data: {
            title: `Markingscheme for ${studentName}`,
            resourcetype: markingschemeResourceType[0].id, // Link to the markingscheme resourcetype
            student: student.id,
            assessment: assessment[0].id,
            studyprojects: project.id,
          },
        });

        // Upload markingscheme file
        await strapi.plugin('upload').service('upload').upload({
          data: {
            refId: markingschemeResource.id, // Associate with resource
            ref: 'api::resource.resource',
            field: 'file',
          },
          files: markingschemeFile,
        });

        markingschemeResourceId = markingschemeResource.id;
        markingType = 'MarkingScheme'; // Set marking type to MarkingScheme
      }

      // Create marking
      const marking = await strapi.entityService.create('api::marking.marking', {
        data: {
          title: `Marking for ${studentName}`,
          status: 'Completed',
          assessment: assessment[0].id,
          student: student.id,
          studyproject: project.id,
          resources: markingschemeResourceId ? [markingschemeResourceId] : [], // Link markingscheme resource if present
          marking_type: markingType, // Set marking type based on presence of markingscheme
        },
      });

      // Upload answersheet PDF (if provided in request files)
      const answersheetFile = ctx.request.files?.answerSheet;
      if (answersheetFile) {
        await strapi.plugin('upload').service('upload').upload({
          data: {
            refId: marking.id, // Associate with marking
            ref: 'api::marking.marking',
            field: 'submission_file',
          },
          files: answersheetFile,
        });
      }

     
        // Invoke the mark function after updating the status
        await strapi.controller('api::marking.marking').markPaper({
          params: { id: marking.id },
          badRequest: (msg) => console.error(msg), // Mock for error handling
        });
    

      return ctx.send({ message: 'Student registered, project created, and marking initiated successfully', student, project, marking });


    } catch (error) {
      console.error('Error in verifyAndRegisterStudent:', error);
      ctx.badRequest('Failed to verify and register student');
    }
  }
}));