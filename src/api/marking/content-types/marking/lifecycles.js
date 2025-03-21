'use strict';

module.exports = {
  async afterCreate(event) {
    try {
      const { result } = event; // Get the newly created session
      const sessionId = result.id;


      const fullSession = await strapi.entityService.findOne('api::ai-training-session.ai-training-session', sessionId, {
        populate: ['studyproject'], // ✅ Populate relational fields
      });

      // Prepare the data for the Activity entry (initially at 0% progress)
      const createData = {
        name: "Assessment- " + result.title, // Mapping session.title to activity.name
        description: `AssessmentMarking Activity created for session ${sessionId}`, // Optional description
        progress: 25, // New session starts at 0% progress
        entity: "Assessment",
        studyproject: fullSession.studyproject.id,
        entityid: sessionId
      };

      // Create Activity entry
      strapi.entityService.create('api::activity.activity', {
        data: createData
      });

      strapi.log.info(`✅ Activity created for new AI Training Session ID: ${sessionId}, Progress: 0%`);
    } catch (error) {
      strapi.log.error('❌ Error creating activity on session creation:', error);
    }
  },

  async afterUpdate(event) {
    try {
      const { result } = event; // Get the updated session
      const sessionId = result.id;

      // Define progress based on status
      const statusProgressMap = {
        "InProgress": 25,
        "Completed": 50,
        "Submitted": 50,
        "Abandoned": 0,
        "MarkingInProgress": 75,
        "MarkingCompleted": 100,
        "MarkingFailed": 50
      };

      // Get progress based on session status (default to 0 if status is missing)
      const progress = statusProgressMap[result.status] || 0;

      const fullSession = await strapi.entityService.findOne('api::marking.marking', sessionId, {
        populate: ['studyproject', 'student.user'], // ✅ Populate relational fields
      });


      // Prepare the data for the Activity entry
      const createData = {
        name: "Assessment- " + result.title, // Mapping session.title to activity.name
        description: `AssessmentMarking Activity updated for session ${sessionId}`, // Optional description
        progress: progress, // Based on session status
        entity: "Assessment",
        studyproject: fullSession.studyproject.id,
        student: fullSession.student.id,
        entityid: sessionId
      };

      // Create Activity entry
      strapi.entityService.create('api::activity.activity', {
        data: createData
      });


      strapi.log.info(`✅ Activity updated for AI Training Session ID: ${sessionId}, Status: ${result.status}, Progress: ${progress}%`);

      // Send email if status is 'MarkingCompleted'
      if (result.status === 'MarkingCompleted') {
        // Fetch the student's email (assuming it's stored in the student object)
        const studentEmail = fullSession.student.user.email;

        // Prepare the email payload
        const emailPayload = {
          session: {
            title: fullSession.title,
            markings: fullSession.marking,
            finalscore: fullSession.finalscore// Assuming this contains the marking details
          },
          student: {
            username: fullSession.student.user.username,
            email: fullSession.student.user.email,
          },
          studyproject: {
            name: fullSession.studyproject.name,
          },
        };

        // Calculate totals
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalPartial = 0;
        let totalMarks = 0;
        let totalMaxMarks = 0;

        fullSession.marking.forEach((mark) => {
          if (mark.marks_awarded === mark.max_marks) {
            totalCorrect += 1; // Fully correct
          } else if (mark.marks_awarded === 0) {
            totalWrong += 1; // Fully wrong
          } else {
            totalPartial += 1; // Partially correct
          }
          totalMarks += mark.marks_awarded; // Total marks awarded
          totalMaxMarks += mark.max_marks; // Total maximum marks
        });

        // Calculate overall percentage
        const overallPercentage = ((totalMarks / totalMaxMarks) * 100).toFixed(2);

        // Add calculated values to the payload
        emailPayload.session.totalcorrect = totalCorrect;
        emailPayload.session.totalwrong = totalWrong;
        emailPayload.session.partial = totalPartial;
        emailPayload.session.total = fullSession.marking.length; // Total number of questions
        emailPayload.session.overall = overallPercentage; // Overall percentage

        // Send the email using Strapi Email Designer
        await strapi
          .plugin('email-designer')
          .service('email')
          .sendTemplatedEmail(
            {
              to: studentEmail, // Send to the student's email
              from: 'support@studywitheve.com', // Optional: Set a default from email
              replyTo: 'support@studywitheve.com', // Optional: Set a reply-to email
            },
            {
              templateReferenceId: 2, // Use template reference ID 2
              subject: `Your Assessment Marking is Complete`, // Email subject
            },
            emailPayload // Dynamic data for the email template
          );

        strapi.log.info(`📧 Email sent to student ${studentEmail} for completed marking session ${sessionId}`);
      }

    } catch (error) {
      strapi.log.error('❌ Error updating activity automatically:', error);
    }
  },

};
