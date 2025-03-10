import React from 'react';
import LoadTopicButton from './LoadTopicButton';

const CustomEditView = (props) => {
  //  console.log(props);
  // Check if the current entity is 'assessment'
  const isAssessment = props.slug === 'api::assessment.assessment';

  return (
    <div>
    {props.children}
      {/* Render the LoadTopic button only for the assessment entity */}
      {isAssessment && <LoadTopicButton />}
    </div>
  );
};

export default CustomEditView;