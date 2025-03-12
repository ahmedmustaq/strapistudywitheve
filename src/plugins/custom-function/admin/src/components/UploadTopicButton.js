import React from 'react';
import { Button } from '@strapi/design-system/Button'; // Strapi's Button component
import { Flex } from '@strapi/design-system/Flex'; // Strapi's Flex component for layout
import { useFetchClient } from '@strapi/helper-plugin'; // Hook to make API requests
import { useNotification } from '@strapi/helper-plugin'; // Hook to show notifications
import { useParams } from 'react-router-dom'; // Hook to access route parameters

const UploadTopicsButton = () => {
  const { post } = useFetchClient(); // HTTP client for API requests
  const toggleNotification = useNotification(); // Hook to show notifications
  const { id: assessmentId } = useParams(); // Get the assessment ID from the URL

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);

    try {
      // Step 1: Call the custom endpoint to upload the CSV
      const { data } = await post(`/api/assessments/${assessmentId}/upload-topics`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 2: Show a success notification
      toggleNotification({
        type: 'success',
        message: data.message || 'Topics uploaded successfully!',
      });
    } catch (error) {
      console.error('Error uploading topics:', error);

      // Step 3: Show an error notification
      toggleNotification({
        type: 'warning',
        message: 'Failed to upload topics. Check the console for details.',
      });
    }
  };

  return (
    <Flex justifyContent="end" paddingTop={4}>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </Flex>
  );
};

export default UploadTopicsButton;