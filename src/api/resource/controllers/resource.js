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

      // Check if both file and content are empty or both are provided
      const hasFile = resource.file && resource.file.length > 0;
      const hasContent = resource.content && resource.content.trim().length > 0;

      if (!hasFile && !hasContent) {
        return ctx.badRequest('Either resource file or content must be provided');
      }

      if (hasFile && hasContent) {
        return ctx.badRequest('Only one of resource file or content should be provided, not both');
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
      } else  {
        chatgptPrompt = "Compare the specs and the notes details. Organize the coverage against each section and child sections mentioned in ascending order. Clearly list all the missed details in creating the notes as gaps for each section. Don't miss out on any details.";
      } 

      const payload = {
        input: {
          assets: [],
          chatgptprompt: chatgptPrompt,
          ...additionalInput,
        },
        output: outputFields
      };

      // Add file asset only if file is provided
      if (resource.file && resource.file.length > 0) {
        payload.input.assets.push({
          id: resource.file[0].id,
          processor: analysisType === 'mindmap' ? 'gemini' : 'pdfProcessor'
        });
      }

      // Add specs asset
      payload.input.assets.push({
        id: resource.topic.specs.id,
        processor: 'pdfProcessor'
      });

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