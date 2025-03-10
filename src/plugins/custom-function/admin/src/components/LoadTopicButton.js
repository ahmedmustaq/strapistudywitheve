import React from 'react';
import { Button } from '@strapi/design-system/Button'; // Strapi's Button component
import { Flex } from '@strapi/design-system/Flex'; // Strapi's Flex component for layout
import { useFetchClient } from '@strapi/helper-plugin'; // Hook to make API requests
import { useNotification } from '@strapi/helper-plugin'; // Hook to show notifications

import { useLocation, useParams } from 'react-router-dom'; // Hooks to access route information

const LoadTopicButton = () => {
  const location = useLocation(); // Access the current URL
  const params = useParams(); // Access route parameters
  const assessmentId = params.id; // Get the assessment ID from the URL
  const { get, put } = useFetchClient(); // HTTP client for API requests
  const toggleNotification = useNotification(); // Hook to show notifications

  const handleClick = async () => {
    try {
    

      const { data: assessment } = await get('/api/assessments/' + assessmentId); // Replace '1' with the actual assessment ID
      const firstLevelTopics = assessment.topics || [];

      // Step 2: Build the topic tree starting from the first-level topics
      const topicTree = await Promise.all(
        firstLevelTopics.map((topic) => buildTopicTree(topic, get))
      );

      // Step 3: Update the assessment's topictree field
      const updatedAssessment = { ...assessment, topictree: topicTree };

      if(topicTree)
      {
        // Step 4: Save the updated assessment
        await put('/api/assessments/' + assessmentId, {
            data: updatedAssessment,
        });
            // Show a success notification
        toggleNotification({
            type: 'success',
            message: 'Topic tree loaded and updated successfully!',
        });
      }
      else{
        toggleNotification({
            type: 'info',
            message: 'No topic exist!',
        });
      }

     
    } catch (error) {
      console.error('Error loading topics:', error);

      // Show an error notification
      toggleNotification({
        type: 'warning',
        message: 'Failed to load topics. Check the console for details.',
      });
    }
  };

  // Helper function to build the topic tree recursively
  const buildTopicTree = async (topic, get) => {
    // Fetch child topics where the parent matches the current topic
    const { data: childTopics } = await get('/api/topics', {
      params: {
        filters: { parent: topic.id }, // Filter by parent ID
        populate: '*', // Populate all relations
      },
    });

    // Recursively build the tree for each child topic
    const children = await Promise.all(
      childTopics.map((child) => buildTopicTree(child, get))
    );

    // Return the current topic with its children
    return {
      id: topic.id,
      title: topic.title,
      code: topic.code,
      children: children,
    };
  };

  return (
    <Flex justifyContent="end" paddingTop={4}>
      <Button variant="default" onClick={handleClick}>
        LoadTopic
      </Button>
    </Flex>
  );
};

export default LoadTopicButton;