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
        populate: ['submission_file', 'resources.file', 'resources.resourcetype.workflow_name'],
      });

      if (!marking) {
        return ctx.badRequest('Marking not found');
      }

      if (!marking.submission_file || !marking.submission_file.length) {
        return ctx.badRequest('Submission file not found');
      }

      if (!marking.resources || !marking.resources.length) {
        return ctx.badRequest('Marking scheme not found');
      }

      const relevantResource = marking.resources.find(resource => 
        resource.resourcetype.code === 'pastpapers' || resource.resourcetype.code === 'generatedpapers');

      const markingSchemeResource = marking.resources.find(resource => 
        resource.resourcetype.code === 'markingscheme')?.file?.[0]; // Ensure it's picking the first file object

      strapi.log.info(JSON.stringify(markingSchemeResource));

      if (!relevantResource || !relevantResource.resourcetype.workflow_name) {
        return ctx.badRequest('Workflow not found for this marking type');
      }

      if (!markingSchemeResource) {
        return ctx.badRequest('Marking scheme resource not found');
      }

      const workflowId = relevantResource.resourcetype.workflow_name.id;

      // Update marking status to MarkingInProgress
      await strapi.entityService.update('api::marking.marking', marking.id, {
        data: { status: 'MarkingInProgress' }
      });

      // Start marking process asynchronously
      this.processAnalysis(ctx, marking, workflowId, markingSchemeResource);

      return ctx.send({ message: `Marking initiated, status set to MarkingInProgress` });
    } catch (error) {
      strapi.log.error('Error analyzing marking:', error);
      return ctx.internalServerError('Failed to analyze marking');
    }
  },

  async processAnalysis(ctx, marking, workflowId, markingSchemeResource) {
    try {
      const gptPrompt = "You are an expert examiner. Your task is to compare a provided student's work with a marking scheme and grade it according to the scheme. The student’s work consists of multiple pages, and each page may contain different sections. Instructions: 1. Extract Sections & Numbering - Identify distinct sections in the student's work. - Assign the same section number to each based on its position in the document. 2. Compare with Marking Scheme - For each section, locate the corresponding criteria in the marking scheme. - Check if the student’s response meets the marking scheme's requirements. - Award marks accordingly. 3. Provide Detailed Feedback - Clearly indicate marks awarded per section. - Include justifications for awarded or deducted marks. - Offer constructive feedback where improvements can be made.";
      const outputFields = ["geminiResponse"];

      const payload = {
        input: {
          assets: [
            { id: marking.submission_file[0].id, processor: 'gemini' },
            { id: markingSchemeResource.id, processor: 'gemini' }
          ],
          gptPrompt,
        },
        output: outputFields
      };

      const workflowService = strapi.plugin('workflow')?.service('workflowService');
      if (!workflowService) {
        return ctx.internalServerError('Workflow service not found');
      }

      const result = await workflowService.executeWorkflow(workflowId, payload);
      
      const updateData = {
        marking: result.geminiResponse.questions || undefined,
        feedback: result.geminiResponse.overall_feedback || undefined,
        finalscore: result.geminiResponse.final_score || undefined,
        status: 'MarkingCompleted' // Update status once marking is completed
      };

      await strapi.entityService.update('api::marking.marking', marking.id, {
        data: updateData
      });
      
      strapi.log.info(`Marking analysis completed for ID ${marking.id}`);
    } catch (error) {
      strapi.log.error(`Error processing analysis for marking:`, error);
      await strapi.entityService.update('api::marking.marking', marking.id, {
        data: { status: 'MarkingFailed' }
      });
    }
  }

}));
