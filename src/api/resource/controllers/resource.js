'use strict';

/**
 * resource controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::resource.resource', ({ strapi }) => ({
  
  async analyzeResource(ctx) {
    try {
      const { id } = ctx.params;

      const resource = await strapi.entityService.findOne('api::resource.resource', id, {
        populate: ['file', 'topic.specs', 'resourcetype.workflow_name'],
      });

      if (!resource) {
        return ctx.badRequest('Resource not found');
      }

      if (!resource.file || !resource.file.length) {
        return ctx.badRequest('Resource file not found');
      }

      if (!resource.topic || !resource.topic.specs) {
        return ctx.badRequest('Topic specs not found');
      }

      if (!resource.resourcetype || !resource.resourcetype.workflow_name) {
        return ctx.badRequest('Workflow not found for this resource type');
      }

      const workflowId = resource.resourcetype.workflow_name.id;

      return await this.processAnalysis(ctx, resource, workflowId);
    } catch (error) {
      strapi.log.error('Error analyzing resource:', error);
      return ctx.internalServerError('Failed to analyze resource');
    }
  },

  async processAnalysis(ctx, resource, workflowId) {
    try {
      const analysisType = resource.resourcetype.code;
      let chatgptPrompt;
      let outputFields = ["chatGPTResponse"];
      let additionalInput = {};

      if (analysisType === 'mindmap') {
        chatgptPrompt = `Compare the specs and the ${resource.resourcetype.name} details. Organize the coverage against each section and child sections mentioned in ascending order. Clearly list all the missed details in creating the ${resource.resourcetype.name} as gaps for each section. Don't miss out on any details.`;
        additionalInput.gptprompt = "Analyze the given resource and give the outline map in JSON format";
        outputFields.push("geminiResponse");
      } else if (analysisType === 'pdfcontent') {
        chatgptPrompt = "Compare the specs and the notes details. Organize the coverage against each section and child sections mentioned in ascending order. Clearly list all the missed details in creating the notes as gaps for each section. Don't miss out on any details.";
      } else {
        return ctx.badRequest('Invalid resource type. Expected "mindmap" or "pdfcontent".');
      }

      const payload = {
        input: {
          assets: [
            { id: resource.file[0].id, processor: analysisType === 'mindmap' ? 'gemini' : 'pdfProcessor' },
            { id: resource.topic.specs.id, processor: 'pdfProcessor' }
          ],
          chatgptprompt: chatgptPrompt,
          ...additionalInput,
        },
        output: outputFields
      };

      const workflowService = strapi.plugin('workflow')?.service('workflowService');
      if (!workflowService) {
        return ctx.internalServerError('Workflow service not found');
      }

      const result = await workflowService.executeWorkflow(workflowId, payload);
      
      const updateData = {
        analysis: result.chatGPTResponse || undefined,
        oci_content: result.geminiResponse ? JSON.stringify(result.geminiResponse) : undefined,
      };

      await strapi.entityService.update('api::resource.resource', resource.id, {
        data: updateData
      });
      
      return ctx.send({ message: `${resource.resourcetype.name} analysis completed successfully` });
    } catch (error) {
      strapi.log.error(`Error processing analysis for ${resource.resourcetype.code}:`, error);
      return ctx.internalServerError(`Failed to analyze ${resource.resourcetype.code}`);
    }
  }

}));
