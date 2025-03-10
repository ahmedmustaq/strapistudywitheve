'use strict';

module.exports = {
  async afterCreate(event) {
    try {
      const { result } = event; // Get the created session
      const sessionId = result.id;

      // Get Strapi instance
      const strapiInstance = strapi;


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

      const fullSession = await strapi.entityService.findOne('api::ai-training-session.ai-training-session', sessionId, {
        populate: ['studyproject', 'topic', 'student'], // ✅ Populate relational fields
      });


      if (!fullSession.questions || fullSession.questions.length === 0) {

        // Call the generateQuestion method in the controller
        strapiInstance.controller('api::ai-training-session.ai-training-session').generateQuestion({
          params: { id: sessionId, workflow: "GenerateTrainingQuestions" },
          badRequest: (msg) => console.error(msg), // Mock for error handling in controller
        });
      }


      // Prepare the data for the Activity entry
      const createData = {
        name: "AITraining- " + result.title, // Mapping session.title to activity.name
        description: `AITraining Activity updated for session ${sessionId}`, // Optional description
        progress: progress, // Based on session status
        entity: "AITraining",
        studyproject: fullSession.studyproject.id,
        topic: fullSession.topic.id,
        student: fullSession.student.id,
        entityid: sessionId
      };

      // Create Activity entry
      await strapi.entityService.create('api::activity.activity', {
        data: createData
      });



      strapi.log.info(`✅ Questions automatically generated for AI Training Session ID: ${sessionId}`);
    } catch (error) {
      strapi.log.error('❌ Error generating questions automatically:', error);
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
     
      
      const fullSession = await strapi.entityService.findOne('api::ai-training-session.ai-training-session', sessionId, {
        populate: ['studyproject', 'topic'], // ✅ Populate relational fields
      });

      if (result.status === 'Completed') {
        await strapi.entityService.update('api::ai-training-session.ai-training-session', sessionId, {
          data: { status: 'MarkingInProgress' }
        });

        // Invoke the mark function after updating the status
        strapi.controller('api::ai-training-session.ai-training-session').mark({
          params: { id: sessionId, workflow: "MarkTrainingAnswers" },
          badRequest: (msg) => console.error(msg), // Mock for error handling
        });

      
      }

      
        // Get progress based on session status (default to 0 if status is missing)
        const progress = statusProgressMap[result.status] || 0;


        // Prepare the data for the Activity entry
        const createData = {
          name: "AITraining- " + result.title, // Mapping session.title to activity.name
          description: `AITraining Activity updated for session ${sessionId}`, // Optional description
          progress: progress, // Based on session status
          entity: "AITraining",
          studyproject: fullSession.studyproject.id,
          topic: fullSession.topic.id,
          entityid: sessionId
        };

        // Create Activity entry
        await strapi.entityService.create('api::activity.activity', {
          data: createData
        });

        strapi.log.info(`✅ Activity updated for AI Training Session ID: ${sessionId}, Status: ${result.status}, Progress: ${progress}%`);

    } catch (error) {
      strapi.log.error('❌ Error updating activity automatically:', error);
    }
  }

};
