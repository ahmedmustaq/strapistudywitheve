'use strict';

const student = require('../../student/controllers/student');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ai-training-session.ai-training-session', ({ strapi }) => ({


  async retake(ctx) {
    const { id } = ctx.params; // Get session ID
    const { generateNew } = ctx.request.body; // Get generateNew flag from payload
  
    if (typeof generateNew !== 'boolean') {
      return ctx.badRequest('generateNew flag is required and must be a boolean.');
    }
  
    // Retrieve the AI training session
    const session = await strapi.entityService.findOne('api::ai-training-session.ai-training-session', id, {
      populate: ['resources.file', 'topic.spec', 'questiontypes', 'questions','student','studyproject','assessment'], // Fetch questiontypes and questions
    });
  
    if (!session) {
      return ctx.badRequest('AI Training Session not found');
    }
  
    // Check if the session is a revision session
    if (session.generationtype === 'Revision') {
      return ctx.badRequest('Revision sessions cannot be retaken.');
    }
    const currentDate = new Date().toISOString().split('T')[0];
    // Duplicate the session and return the new session ID
    const newSessionData = {
      ...session,
      id: undefined, // Remove the ID to create a new entry
      title: `${session.title}-Retake-${currentDate}`,
      status: 'InProgress', // Reset status to InProgress
      marking: undefined, // Remove marking
      finalscore: undefined, // Remove finalscore
      feedback: undefined, // Remove feedback
      submission: undefined, // Remove submission
      submission_file: undefined, // Remove submission_file
      resources: session.resources, // Copy resources as-is
      questions: generateNew ? [] : session.questions, // Replicate questions only if generateNew is false
    };
  
    // Create the new session
    const newSession = await strapi.entityService.create('api::ai-training-session.ai-training-session', {
      data: newSessionData,
    });
  
    
  
    // Return the new session ID immediately
    return ctx.send({
      message: generateNew
        ? 'Session created successfully. New questions will be generated asynchronously.'
        : 'Session duplicated successfully with the same questions.',
      newSessionId: newSession.id,
    });
  },

  async generateQuestion(ctx) {
    try {
      const { id, workflow } = ctx.params; // Get session ID and workflow name

      // Retrieve the AI training session
      const session = await strapi.entityService.findOne('api::ai-training-session.ai-training-session', id, {
        populate: ['resources.file', 'topic.spec', 'questiontypes','student'], // Fetch questiontypes
      });

      if (!session) {
        return ctx.badRequest('AI Training Session not found');
      }

      // Extract resources (files or text content)
      let assetIds = [];
      let combinedContent = "";

      for (const resource of session.resources) {
        if (resource.oci_content) {
          combinedContent += JSON.stringify(resource.oci_content) + "\n\n";
        } else if (resource.content) {
          combinedContent += resource.content + "\n\n";
        } else if (resource.file && resource.file.length > 0) {
          assetIds.push(...resource.file.map(file => ({ id: file.id, processor: "pdfProcessor" })));
        }
      }


      if (!session.topic && session.topic.spec) {
        assetIds.push(...session.topic.spec.map(file => ({ id: file.id, processor: "pdfProcessor" })));
      }

      // Validate that at least some content is available
      if (assetIds.length === 0 && !combinedContent.trim()) {
        return ctx.badRequest('No valid resource content or files found.');
      }

      // // Include topic if available
      // if (session.topic) {
      //   combinedContent += `\nTopic: ${session.topic.title}\n\n`;
      // }

      // Include question count and difficulty
      const questionCount = session.noofquestions || 5; // Default to 5 if not specified
      const difficulty = session.difficulty || "Hard"; // Default to "Hard" if not specified

      // Extract question types using `code` from `questiontypes` relation
      const questionTypes = session.questiontypes?.map(q => q.code) || ["mcq", "short answer"];

        // Fetch existing questions from the question bank for the same topic
        let existingQuestions = [];
        if (session.topic) {
          existingQuestions = await strapi.entityService.findMany('api::questionbank.questionbank', {
            filters: {
              $and: [
                { topic: session.topic.id }, // Filter by topic
                { student: session.student.id }, // Filter by student
              ],
            },
        
            fields: ['question'],
          });
        }

      // Construct GPT instruction
      const gptPrompt = `
        Generate ${questionCount} GCSE-style questions based on the provided content.
        Ensure the questions align with the given topic number mentioned in the specification and have the difficulty level ${difficulty}.
        Question Types: ${questionTypes.join(", ")}
        Structure them appropriately with a mix of formats.
         Do not repeat the following questions:
        ${existingQuestions.map(q => q.question).join("\n")}
      `;

      // Get workflow service
      const workflowService = strapi.plugin('workflow')?.service('workflowService');
      if (!workflowService) {
        return ctx.internalServerError('Workflow service not found.');
      }

      // **Fetch Workflow ID from Name**
      const workflowName = workflow || "GenerateTrainingQuestions"; // Default name
      const workflowEntry = await strapi.entityService.findMany('plugin::workflow.workflow', {
        filters: { name: workflowName },
        fields: ['id'],
        limit: 1
      });

      if (!workflowEntry || workflowEntry.length === 0) {
        return ctx.badRequest(`Workflow '${workflowName}' not found.`);
      }

      const workflowId = workflowEntry[0].id;

      // Construct payload for workflow execution
      const payload = {
        input: {
          // Only include assets if they exist, otherwise skip the FindAsset task
          assets: assetIds.length > 0 ? assetIds : undefined,
          content: combinedContent.trim(),
          chatgptprompt: gptPrompt.trim(),
          pdfcontent: assetIds.length === 0 ? "no file" : undefined,
        },
        output: ["chatGPTResponse"],
        skip: assetIds.length === 0 ? ["FindAsset"] : undefined,  // Skip the FindAsset task if no assets
      };

      // Execute workflow to generate questions
      const result = await workflowService.executeWorkflow(workflowId, payload);

      // Save generated questions into the session
      await strapi.entityService.update('api::ai-training-session.ai-training-session', id, {
        data: { questions: result.chatGPTResponse.generated_questions || [] }
      });

     
    } catch (error) {
      strapi.log.error('Error generating questions:', error);
       
    }
  },

  async mark(ctx) {
    try {
      const { id, workflow } = ctx.params; // Get session ID and workflow name

      // Retrieve the AI training session
      const session = await strapi.entityService.findOne(
        'api::ai-training-session.ai-training-session',
        id,
        {
          populate: ['topic', 'submission_file','studyproject','student'], // Include submission file if needed
        }
      );

      if (!session) {
        return ctx.badRequest('AI Training Session not found');
      }

      // Ensure questions are available
      if (!session.questions || session.questions.length === 0) {
        return ctx.badRequest('No questions available for marking.');
      }

      // Construct GPT instruction
      const gptPrompt = `
        Given the following questions and student responses, evaluate the correctness of each answer.
        - Assign marks based on a marking scheme.
        - Provide an explanation of the marking.
        - Suggest a better answer if the given answer is incorrect or partial.
      `;

      // Define payload with mandatory fields
      let payload = {
        input: {
          questions: JSON.stringify(session.questions),
          chatgptprompt: gptPrompt.trim(),
        },
        output: ["chatGPTResponse", "geminiResponse"],
        skip: [], // Skipped tasks will be added dynamically
      };

      let usedSubmissionFile = false;

      // Handle `geminiResponse` based on `submission.answers`
      if (session.submission) {
        payload.input.geminiResponse = JSON.stringify(session.submission);
        payload.skip.push('ExtractContentForTraining_Gemini', 'FindAsset'); // Skip these tasks
      } else if (session.submission_file && session.submission_file.id) {
        payload.input.assets = [{ id: session.submission_file.id, processor: "gemini" }];
        payload.input.gptprompt = "Extract the questions and answers and respond with json '{'questionnumber','answer'} format'";
        usedSubmissionFile = true; // Mark that a submission file was used
      } else {
        return ctx.badRequest('No valid submission found for marking.');
      }

      // **Fetch Workflow ID from Name**
      const workflowName = workflow || 'MarkTrainingAnswers'; // Default name
      const workflowEntry = await strapi.entityService.findMany(
        'plugin::workflow.workflow',
        {
          filters: { name: workflowName },
          fields: ['id'],
          limit: 1,
        }
      );

      if (!workflowEntry || workflowEntry.length === 0) {
        return ctx.badRequest(`Workflow '${workflowName}' not found.`);
      }

      const workflowId = workflowEntry[0].id;

      // Get workflow service
      const workflowService = strapi.plugin('workflow')?.service('workflowService');
      if (!workflowService) {
        return ctx.internalServerError('Workflow service not found.');
      }

      // Execute workflow to mark questions
      const result = await workflowService.executeWorkflow(workflowId, payload);

      if (!result || !result.chatGPTResponse) {
        return ctx.internalServerError('Failed to retrieve marking results.');
      }

      // Prepare data update payload
      let updateData = {
        marking: result.chatGPTResponse.questions || undefined,
        feedback: result.chatGPTResponse.overall_feedback || undefined,
        finalscore: result.chatGPTResponse.final_score || undefined,
        status: 'MarkingCompleted' // Update status once marking is completed
      };

      // If a submission file was used, update the `submission` field as well
      if (usedSubmissionFile && result.geminiResponse) {
        updateData.submission = result.geminiResponse || [];
      }

      const updatedSession = await strapi.entityService.update(
        'api::ai-training-session.ai-training-session',
        id,
        {
          data: updateData, // The data to update
          populate: ['topic.subject','studyproject','student'], // Populate the topic and its subject
        }
      )
      const questions = result.chatGPTResponse.questions;


      if (questions && questions.length > 0 && session.generationtype  != 'Revision') {

        // Call the new method to add questions to the question bank
        await this.addQuestionsToQuestionBank(questions, updatedSession);
      }
      else{
        await this.updateQuestionInQuestionBank(questions, updatedSession);
        
      }

    } catch (error) {
      strapi.log.error('Error marking questions:', error);
      return ctx.internalServerError('Failed to mark questions.');
    }
  },

   // New method to add questions to the question bank
   async addQuestionsToQuestionBank(questions, session) {

    // Helper function to determine the graded value
  const getGradedValue = (marksAwarded, maxMarks) => {
    if (marksAwarded === maxMarks) {
      return 'correct';
    } else if (marksAwarded > 0) {
      return 'partial';
    } else {
      return 'wrong';
    }
  };

    for (const question of questions) {
      try {
        let topicId = null;

        // Fetch the topic entity based on topic_name (if topic_name is provided)
        if (question.topic_name) {
          const topic = await strapi.entityService.findMany('api::topic.topic', {
            filters: { title: question.topic_name },
            limit: 1,
          });

          if (topic && topic.length > 0) {
            topicId = topic[0].id; // Use the topic ID if found
          } else {
            topicId = session?.topic?.id;
            console.warn(`Topic not found for topic_name: ${question.topic_name}, setting the session topic`);
          }
        }

    // Calculate the graded value
      const graded = getGradedValue(question.marks_awarded, question.max_marks);
        // Map the question data to the questionbank schema
        const questionData = {
          question: question.question_text,
          options:JSON.stringify(question.options),
          answer: question.student_answer,
          best_answer: question.best_answer,
          questiontype:question.question_type,
          marking_criteria: JSON.stringify(question.marking_scheme),
          max_marks: question.max_marks,
          marks_awarded: question.marks_awarded,
          difficulty: question.difficulty,
          subject: session.topic?.subject?.name ?? undefined,
          student: session.student.id,
          sessionid: session.id,
          topicName: question.topic_name,
          studyproject: session.studyproject.id,
          sessiontype: 'AITraining', // Assuming this is always 'AITraining'
          topic: topicId ? [topicId] : undefined, // Link the topic if it exists
          graded: graded
        };

        // Create an entry in the questionbank table (asynchronously)
        await strapi.entityService.create('api::questionbank.questionbank', {
          data: questionData,
        });
      } catch (error) {
        console.error(`Error processing question: ${question.question_text}`, error);
      }
    }
  },

  async updateQuestionInQuestionBank(questions, session) {
    // Helper function to determine the graded value
    const getGradedValue = (marksAwarded, maxMarks) => {
      if (marksAwarded === maxMarks) {
        return 'correct';
      } else if (marksAwarded > 0) {
        return 'partial';
      } else {
        return 'wrong';
      }
    };
  
    try {
      // Iterate over each question in the array
      for (const question of questions) {
        // Search for the existing question in the question bank
        const existingQuestion = await strapi.entityService.findMany('api::questionbank.questionbank', {
          filters: {
            question: question.question_text,
            questiontype: question.question_type,
            best_answer: question.best_answer,
          },
          limit: 1,
        });
  
        if (existingQuestion && existingQuestion.length > 0) {
          // Update the existing question
          const updatedQuestion = await strapi.entityService.update('api::questionbank.questionbank', existingQuestion[0].id, {
            data: {
              answer: question.student_answer, // Update the student's answer
              marks_awarded: question.marks_awarded, // Update marks awarded
              graded: getGradedValue(question.marks_awarded, question.max_marks), // Recalculate graded value
            },
          });
          console.log(`Updated question: ${updatedQuestion.question}`);
        } else {
          console.warn(`Question not found in question bank: ${question.question_text}`);
          // Optionally, you can create a new entry if the question is not found
          await this.addQuestionsToQuestionBank([question], session);
        }
      }
    } catch (error) {
      console.error(`Error updating questions:`, error);
    }
  },
  async generateBank(ctx) {
    const { id } = ctx.params;
  
    try {
      // Fetch the session data with necessary relations populated
      const session = await strapi.entityService.findOne('api::ai-training-session.ai-training-session', id, {
        populate: {
          assessment: {
            populate: {
              subject: true, // Populate the subject
            },
          },
          student: true, // Populate the student
          studyproject: true, // Populate the study project
          questions: true, // Populate the questions
        },
      });
  
      // Check if the session exists
      if (!session) {
        return ctx.notFound('Session not found');
      }
  
      // Check if the session has questions
      if (!session.questions || session.questions.length === 0) {
        return ctx.badRequest('No questions found in the session');
      }
  
      // Call the addQuestionsToQuestionBank function to process the questions
      await this.addQuestionsToQuestionBank(session.questions, session);
  
      // Return a success response
      return ctx.send({
        message: 'Questions successfully added to the question bank',
      });
    } catch (error) {
      console.error('Error generating question bank:', error);
      return ctx.internalServerError('An error occurred while generating the question bank');
    }
  }


}));
