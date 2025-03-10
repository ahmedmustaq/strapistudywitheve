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
          populate: ['studyproject','student'], // ✅ Populate relational fields
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

        // if(fullSession.status == 'Completed')
        // {
        //   // Invoke the mark function after updating the status
        //   await strapi.controller('api::marking.marking').markPaper({
        //     params: { id: sessionId },
        //     badRequest: (msg) => console.error(msg), // Mock for error handling
        //   });
        // }

      } catch (error) {
        strapi.log.error('❌ Error updating activity automatically:', error);
      }
    },
    
  };
  