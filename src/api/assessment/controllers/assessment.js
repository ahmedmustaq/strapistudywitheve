'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const csv = require('csv-parser'); // For parsing CSV files
const fs = require('fs'); // For reading files

module.exports = createCoreController('api::assessment.assessment', ({ strapi }) => ({
  // Custom method to generate and update the topic tree
  async updateTopicTree(ctx) {
    try {
      const { id } = ctx.params; // Get the assessment ID from the request params

      // Step 1: Fetch the assessment data
      const assessment = await strapi.entityService.findOne('api::assessment.assessment', id, {
        populate: '*', // Populate all relations
      });

      // Step 2: Get the first-level topics from the assessment
      const firstLevelTopics = assessment.topics || [];

      // Step 3: Build the topic tree starting from the first-level topics
      const topicTree = await Promise.all(
        firstLevelTopics.map((topic) => buildTopicTree(topic))
      );

      // Step 4: Update the assessment's topictree field
      await strapi.entityService.update('api::assessment.assessment', id, {
        data: { topictree: topicTree },
      });

      // Step 5: Return a success response
      return { success: true, message: 'Topic tree updated successfully!' };
    } catch (error) {
      console.error('Error updating topic tree:', error);
      ctx.throw(500, 'Failed to update topic tree');
    }
  },

 // Custom method to process CSV and create topics
 async uploadTopicsFromCSV(ctx) {
    try {
      const { files } = ctx.request.files;
      const { assessmentId } = ctx.params;

      if (!files) ctx.throw(400, 'No file uploaded');

      const topics = await parseCSV(files.path);
      await createTopics(topics, assessmentId);

      return { success: true, message: 'Topics created successfully!' };
    } catch (error) {
      console.error('Error uploading topics:', error);
      ctx.throw(500, 'Failed to upload topics');
    }
  },


}));

// Helper function to build the topic tree recursively
const buildTopicTree = async (topic) => {
  // Fetch child topics where the parent matches the current topic
  const childTopics = await strapi.entityService.findMany('api::topic.topic', {
    filters: { parent: topic.id }, // Filter by parent ID
    populate: '*', // Populate all relations
  });

  // Recursively build the tree for each child topic
  const children = await Promise.all(
    childTopics.map((child) => buildTopicTree(child))
  );

  // Return the current topic with its children
  return {
    id: topic.id,
    title: topic.title,
    code: topic.code,
    children: children,
  };
};

// Parse the CSV file
const parseCSV = (filePath) => { 
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Clean keys first
          const cleanedRow = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.replace(/^\uFEFF/, '').trim(); // removes BOM & whitespace
            cleanedRow[cleanKey] = row[key];
          });
  
          if (cleanedRow['Code'] && cleanedRow['Title']) {
            results.push({
              code: cleanedRow['Code'].trim(),
              title: cleanedRow['Title'].trim(),
            }); 
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  };
  
  // Create topics recursively
  const createTopics = async (topics, assessmentId) => {
    const assessment = await strapi.entityService.findOne('api::assessment.assessment', assessmentId, {
      populate: { gradelevel: true, subject: true },
    });
  
    if (!assessment) throw new Error('Assessment not found');
  
    const topicMap = new Map();
  
    for (const topic of topics) {
      await createTopicRecursively(topic, topicMap, assessment, topics);
    }
  };
  
  // Recursive helper
  const createTopicRecursively = async (currentTopic, topicMap, assessment, allTopics) => {
    if (topicMap.has(currentTopic.code)) {
      return topicMap.get(currentTopic.code);
    }
  
    // Determine parent code by removing the last segment
    const parentCode = currentTopic.code.includes('.')
      ? currentTopic.code.split('.').slice(0, -1).join('.')
      : null;
  
    // Find or create parent first
    let parentEntity = null;
    if (parentCode) {
      const parentTopic = allTopics.find(t => t.code === parentCode);
      if (parentTopic) {
        parentEntity = await createTopicRecursively(parentTopic, topicMap, assessment, allTopics);
      }
    }
  
    // Find existing topic or create new one
    const existingTopics = await strapi.entityService.findMany('api::topic.topic', {
      filters: { topicNumber: currentTopic.code, title:currentTopic.title, subject: assessment.subject?.id },
    });
  
    let topicEntity;
    if (existingTopics.length > 0) {
      topicEntity = existingTopics[0];
    } else {
      topicEntity = await strapi.entityService.create('api::topic.topic', {
        data: {
          title: currentTopic.title,
          code: currentTopic.code + " " + currentTopic.title,
          topicNumber: currentTopic.code, 
          parent: parentEntity ? parentEntity.id : null,
          gradelevels: assessment.gradelevel.map(g => g.id),
          subject: assessment.subject?.id,
        },
      });
    }
  
    topicMap.set(currentTopic.code, topicEntity);
    return topicEntity;
  };