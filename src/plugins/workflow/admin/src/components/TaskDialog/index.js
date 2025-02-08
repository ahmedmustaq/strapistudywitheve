import React from 'react';
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { TextInput } from '@strapi/design-system/TextInput';
import { Select, Option } from '@strapi/design-system/Select';
import { Box } from '@strapi/design-system/Box';
import styled from 'styled-components';

const StyledDialog = styled(Dialog)`
  width: 50rem;
  max-width: 90vw;
`;

const ScrollableBody = styled(DialogBody)`
  max-height: 80vh;
  overflow-y: auto;
`;

const TaskDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskData, 
  onTaskDataChange,
  editingTask,
  renderConfigForm,
  taskTypes
}) => {
  return (
    <StyledDialog 
      onClose={onClose} 
      title={editingTask ? "Edit task" : "Add new task"} 
      isOpen={isOpen}
    >
      <ScrollableBody>
        <Stack spacing={4}>
          <Box paddingBottom={4}>
            <TextInput
              label="Task Name"
              name="name"
              onChange={e => onTaskDataChange({ ...taskData, name: e.target.value })}
              value={taskData.name}
              placeholder="Enter task name"
              required
            />
          </Box>
          <Box paddingBottom={4}>
            <Select
              label="Task Type"
              value={taskData.type}
              onChange={value => onTaskDataChange({ ...taskData, type: value })}
              required
            >
              {Object.values(taskTypes).map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Box>
          {taskData.type && (
            <Box paddingBottom={4}>
              {renderConfigForm(taskData.type)}
            </Box>
          )}
        </Stack>
      </ScrollableBody>
      <DialogFooter 
        startAction={
          <Button onClick={onClose} variant="tertiary">
            Cancel
          </Button>
        }
        endAction={
          <Button onClick={onSubmit} disabled={!taskData.name || !taskData.type}>
            {editingTask ? 'Update' : 'Add'} task
          </Button>
        }
      />
    </StyledDialog>
  );
};

export default TaskDialog;