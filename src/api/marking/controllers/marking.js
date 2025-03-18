'use strict';

/**
 * marking controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::marking.marking', ({ strapi }) => ({
  

  async markPaper(ctx) {
    try {
      const { id } = ctx.params;

      const marking = await strapi.entityService.findOne('api::marking.marking', id, {
        populate: ['submission_file', 'assessment.topictree', 'resources.file', 'resources.resourcetype.workflow_name'],
      });

      if (!marking) {
        return ctx.badRequest('Marking not found');
      }

      if (!marking.submission_file || !marking.submission_file.length) {
        return ctx.badRequest('Submission file not found');
      }

      if (!marking.resources || !marking.resources.length) {
        return ctx.badRequest('Atleast one paper should be selected');
      }

      const relevantResource = marking.resources.find(resource =>
        resource.resourcetype.code === 'pastpapers' || resource.resourcetype.code === 'generatedpapers');

      const markingSchemeResource = marking.resources.find(resource =>
        resource.resourcetype.code === 'markingscheme')?.file?.[0]; // Ensure it's picking the first file object



      if (!relevantResource || !relevantResource.resourcetype.workflow_name) {
        return ctx.badRequest('Workflow not found for this marking type');
      }

      if (!markingSchemeResource) {
        strapi.log.info('Automarking selected');
      }

      const workflowId = relevantResource.resourcetype.workflow_name.id;

      // Update marking status to MarkingInProgress
      await strapi.entityService.update('api::marking.marking', marking.id, {
        data: { status: 'MarkingInProgress' }
      });

      // Start marking process asynchronously
      this.processAnalysis(ctx, marking, workflowId, markingSchemeResource);

      return ctx.send({
        message: "Marking has been started, please check back after few minutes",
      });
    } catch (error) {
      strapi.log.error('Error analyzing marking:', error);
      return ctx.internalServerError('Failed to analyze marking');
    }
  },

  async processAnalysis(ctx, marking, workflowId, markingSchemeResource) {
    try {

      let gptprompt = `
          This is student answers, try to extract the answers and match it to the questions asked along with the number, the number sequence is important,
      `;
      // 1) Define the base GPT prompt
      let chatgptprompt = `
            Compare the student's answer with the provided marking criteria, validate each answer, and assign marks up to the max_marks while preserving the question number.
Provide detailed feedback with justifications for marks awarded or deducted, including constructive improvement suggestions.
            `;

      // 2) Adjust the prompt if no marking scheme is provided
      if (!markingSchemeResource) {
        chatgptprompt = `
           Mark the student's answer answer, and assign marks up to the max_marks while preserving the question number.
Provide detailed feedback with justifications for marks awarded or deducted, including constructive improvement suggestions along with marking criteria used.
            `;
      }

      // 3) If topictree exists, append additional instructions to gptPrompt
      if (marking?.assessment?.topictree?.length) {
        chatgptprompt += `

            Additional Instruction:
            "Match the questions under this Topic Hierarchy only:
            ${JSON.stringify(marking.assessment.topictree, null, 2)}

            Then match each question to the most relevant topic(s) from the above tree."
            `;
      }

      const outputFields = ["chatGPTResponse"];

      // Prepare the payload
      const payload = {
        input: {
          assets: [
            { id: marking.submission_file[0].id, type:'answersheet',processor: 'gemini' },
          ],
          gptprompt,
          chatgptprompt
        },
        output: outputFields
      };

      // Add marking scheme to the payload if provided
      if (markingSchemeResource) {
        payload.input.assets.push({ id: markingSchemeResource.id, type:'markingscheme',processor: 'gemini' });
        payload.input.markschemeprompt = "Extract the markscheme along with the section number/question number in format 1.x.x as provided and retreive marking criteria";
      } else {
        // If no marking scheme provided, add an input field "content"
        payload.input.content = "Auto generate the marking scheme";
        payload.input.markschemeprompt = "It is a auto markschcme"; //by logic will not be used.
         
      }

      // Execute the workflow
      const workflowService = strapi.plugin('workflow')?.service('workflowService');
      if (!workflowService) {
        return ctx.internalServerError('Workflow service not found');
      }

      const result = await workflowService.executeWorkflow(workflowId, payload);

      // Prepare update data
      const updateData = {
        marking: result.chatGPTResponse.questions || undefined,
        feedback: result.chatGPTResponse.overall_feedback || undefined,
        finalscore: result.chatGPTResponse.final_score || undefined,
        status: 'MarkingCompleted' // Update status once marking is completed
      };

      // Update the marking entity
      const updatedSession = await strapi.entityService.update(
        'api::marking.marking',
        marking.id,
        {
          data: updateData, // The data to update
          populate: ['assessment.subject', 'studyproject', 'student'], // Populate related fields
        }
      );

      strapi.log.info(`Marking analysis completed for ID ${marking.id}`);

      // Call the new method to add questions to the question bank
      await this.addQuestionsToQuestionBank(updateData.marking, updatedSession);

    } catch (error) {
      strapi.log.error(`Error processing analysis for marking:`, error);
      await strapi.entityService.update('api::marking.marking', marking.id, {
        data: { status: 'MarkingFailed' }
      });
    }
  },
  // New method to add questions to the question bank
  async addQuestionsToQuestionBank(questions, session) {
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
            console.warn(`Topic not found for topic_name: ${question.topic_name}`);
          }
        }

        // Calculate the graded value
        const graded = getGradedValue(question.marks_awarded, question.max_marks);
        // Map the question data to the questionbank schema
        const questionData = {
          question: question.question_text,
          answer: question.student_answer,
          options: question.options,
          best_answer: question.best_answer,
          questiontype: question.question_type,
          marking_criteria: JSON.stringify(question.marking_scheme),
          max_marks: question.max_marks,
          marks_awarded: question.marks_awarded,
          difficulty: question.difficulty,
          assessment: session.assessment.id,
          subject: session.assessment.subject.name,
          student: session.student.id,
          studyproject: session.studyproject.id,
          topicName: question.topic_name,
          sessionid: session.id,
          sessiontype: 'Assessment', // Assuming this is always 'AITraining'
          topic: topicId ? [topicId] : undefined, // Link the topic if it exists
          graded: graded, // Add the graded field
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
  async generateBank(ctx) {
    const { id } = ctx.params;

    try {
      // Fetch the session data with necessary relations populated
      const session = await strapi.entityService.findOne('api::marking.marking', id, {
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
      if (!session.marking || session.marking.length === 0) {
        return ctx.badRequest('No questions found in the session');
      }

      // Call the addQuestionsToQuestionBank function to process the questions
      await this.addQuestionsToQuestionBank(session.marking, session);

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
