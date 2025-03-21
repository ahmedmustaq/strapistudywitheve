import React from 'react';
import { Button } from '@strapi/design-system/Button'; // Strapi's Button component
import { Flex } from '@strapi/design-system/Flex'; // Strapi's Flex component for layout
import { useFetchClient } from '@strapi/helper-plugin'; // Hook to make API requests
import { useNotification } from '@strapi/helper-plugin'; // Hook to show notifications
import { useParams } from 'react-router-dom'; // Hook to access route parameters

const LoadTopicButton = () => {
  const { post } = useFetchClient(); // HTTP client for API requests
  const toggleNotification = useNotification(); // Hook to show notifications
  const { id } = useParams(); // Get the assessment ID from the URL

  const handleClick = async () => {
    try {
      // Step 1: Call the custom endpoint to update the topic tree
      const { data } = await post(`/api/assessments/${id}/loadtopics`);

      // Step 2: Show a success notification
      toggleNotification({
        type: 'success',
        message: data.message || 'Topic tree updated successfully!',
      });
    } catch (error) {
      console.error('Error updating topic tree:', error);

      // Step 3: Show an error notification
      toggleNotification({
        type: 'warning',
        message: 'Failed to update topic tree. Check the console for details.',
      });
    }
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