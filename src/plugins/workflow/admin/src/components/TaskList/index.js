import React from 'react';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table';
import { Typography } from '@strapi/design-system/Typography';
import { IconButton } from '@strapi/design-system/IconButton';
import { Flex } from '@strapi/design-system/Flex';
import { Box } from '@strapi/design-system/Box';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import Plus from '@strapi/icons/Plus';
import Pencil from '@strapi/icons/Pencil';
import Trash from '@strapi/icons/Trash';
import { Button } from '@strapi/design-system/Button';

const TaskList = ({ tasks, isLoading, onEdit, onDelete, onAdd }) => {
  if (isLoading) {
    return <Typography>Loading tasks...</Typography>;
  }

  if (tasks.length === 0) {
    return (
      <EmptyStateLayout 
        icon={<Plus />}
        content="No tasks configured for this workflow yet."
        action={
          <Button variant="secondary" startIcon={<Plus />} onClick={onAdd}>
            Add your first task
          </Button>
        }
      />
    );
  }

  return (
    <Table colCount={4} rowCount={tasks.length}>
      <Thead>
        <Tr>
          <Th><Typography variant="sigma">Name</Typography></Th>
          <Th><Typography variant="sigma">Type</Typography></Th>
          <Th><Typography variant="sigma">Parameters</Typography></Th>
          <Th><Typography variant="sigma">Actions</Typography></Th>
        </Tr>
      </Thead>
      <Tbody>
        {tasks.map((task) => (
          <Tr key={task.id}>
            <Td><Typography fontWeight="bold">{task.name}</Typography></Td>
            <Td><Typography>{task.type}</Typography></Td>
            <Td><Typography>{task.taskparams?.length || 0} parameters</Typography></Td>
            <Td>
              <Flex>
                <Box paddingRight={1}>
                  <IconButton 
                    onClick={() => onEdit(task)}
                    label="Edit"
                    icon={<Pencil />}
                  />
                </Box>
                <IconButton 
                  onClick={() => onDelete(task.id)}
                  label="Delete"
                  icon={<Trash />}
                />
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TaskList;