import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Layout, BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Box } from '@strapi/design-system/Box';
import { Typography } from '@strapi/design-system/Typography';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { TextInput } from '@strapi/design-system/TextInput';
import { Textarea } from '@strapi/design-system/Textarea';
import { Status } from '@strapi/design-system/Status';
import { IconButton } from '@strapi/design-system/IconButton';
import { Flex } from '@strapi/design-system/Flex';
import { Alert } from '@strapi/design-system/Alert';
import Plus from '@strapi/icons/Plus';
import Pencil from '@strapi/icons/Pencil';
import Trash from '@strapi/icons/Trash';
import Tasks from '@strapi/icons/Layer';
import { useFetchClient } from '@strapi/helper-plugin';

const initialWorkflowState = {
  name: '',
  description: '',
  uidata: {},
  queue: [],
  status: 'draft'
};

const HomePage = () => {
  const history = useHistory();
  const [workflows, setWorkflows] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState(initialWorkflowState);
  const { post, get, del, put } = useFetchClient();

  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await get('/workflow/workflows');
      const workflowsData = Array.isArray(response.data) ? response.data : 
                           response.data?.data ? response.data.data : [];
      setWorkflows(workflowsData.map(workflow => ({
        ...workflow,
        queue: workflow.queue || [],
        status: workflow.status || 'draft'
      })));
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setError('Failed to load workflows. Please try again.');
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload = {
        ...workflowData,
        queue: workflowData.queue || [],
        status: workflowData.status || 'draft'
      };

      if (editingWorkflow) {
        await put(`/workflow/workflows/${editingWorkflow.id}`, payload);
      } else {
        await post('/workflow/workflows', payload);
      }
      setIsVisible(false);
      fetchWorkflows();
      setWorkflowData(initialWorkflowState);
      setEditingWorkflow(null);
    } catch (error) {
      console.error('Error saving workflow:', error);
      setError(`Failed to ${editingWorkflow ? 'update' : 'create'} workflow. Please try again.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await del('/workflow/workflows/' + id);
      fetchWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      setError('Failed to delete workflow. Please try again.');
    }
  };

  const handleEdit = async (workflow) => {
    setEditingWorkflow(workflow);
    setWorkflowData({
      name: workflow.name,
      description: workflow.description || '',
      uidata: workflow.uidata || {},
      queue: workflow.queue || [],
      status: workflow.status || 'draft'
    });
    setIsVisible(true);
  };

  const closeDialog = () => {
    setIsVisible(false);
    setEditingWorkflow(null);
    setWorkflowData(initialWorkflowState);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'neutral';
      default:
        return 'success';
    }
  };

  return (
    <Layout>
      <BaseHeaderLayout
        title="Workflow Management"
        subtitle="Create and manage content workflows"
        as="h2"
        primaryAction={
          <Button startIcon={<Plus />} onClick={() => setIsVisible(true)}>
            Create new workflow
          </Button>
        }
      />
      
      <ContentLayout>
        {error && (
          <Box padding={4}>
            <Alert closeLabel="Close alert" onClose={() => setError(null)} title="Error" variant="danger">
              {error}
            </Alert>
          </Box>
        )}

        <Box padding={8} background="neutral100">
          <Stack spacing={4}>
            {isLoading ? (
              <Typography>Loading workflows...</Typography>
            ) : workflows.length === 0 ? (
              <EmptyStateLayout 
                icon={<Plus />}
                content="You don't have any workflows yet."
                action={
                  <Button variant="secondary" startIcon={<Plus />} onClick={() => setIsVisible(true)}>
                    Create your first workflow
                  </Button>
                }
              />
            ) : (
              <Table colCount={6} rowCount={workflows.length}>
                <Thead>
                  <Tr>
                    <Th>
                      <Typography variant="sigma">Name</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Description</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Status</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Tasks</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Queue Size</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Actions</Typography>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {workflows.map((workflow) => (
                    <Tr key={workflow.id}>
                      <Td>
                        <Typography fontWeight="bold">{workflow.name}</Typography>
                      </Td>
                      <Td>
                        <Typography>{workflow.description}</Typography>
                      </Td>
                      <Td>
                        <Status variant={getStatusColor(workflow.status)} size="S">
                          {workflow.status || 'Draft'}
                        </Status>
                      </Td>
                      <Td>
                        <Typography>{workflow.tasks?.length || 0} tasks</Typography>
                      </Td>
                      <Td>
                        <Typography>{workflow.queue?.length || 0} items</Typography>
                      </Td>
                      <Td>
                        <Flex>
                          <Box paddingRight={1}>
                            <IconButton 
                              onClick={() => history.push(`/plugins/workflow/workflows/${workflow.id}/tasks`)}
                              label="Manage Tasks"
                              icon={<Tasks />}
                            />
                          </Box>
                          <Box paddingRight={1}>
                            <IconButton 
                              onClick={() => handleEdit(workflow)}
                              label="Edit"
                              icon={<Pencil />}
                            />
                          </Box>
                          <IconButton 
                            onClick={() => handleDelete(workflow.id)}
                            label="Delete"
                            icon={<Trash />}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Stack>
        </Box>
      </ContentLayout>

      <Dialog 
        onClose={closeDialog} 
        title={editingWorkflow ? "Edit workflow" : "Create new workflow"} 
        isOpen={isVisible}
      >
        <DialogBody>
          <Stack spacing={4}>
            <TextInput
              label="Workflow Name"
              name="name"
              onChange={e => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
              value={workflowData.name}
              placeholder="Enter workflow name"
              required
            />
            <Textarea
              label="Description"
              name="description"
              onChange={e => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
              value={workflowData.description}
              placeholder="Enter workflow description"
            />
          </Stack>
        </DialogBody>
        <DialogFooter 
          startAction={
            <Button onClick={closeDialog} variant="tertiary">
              Cancel
            </Button>
          }
          endAction={
            <Button onClick={handleSubmit} disabled={!workflowData.name}>
              {editingWorkflow ? 'Update' : 'Create'} workflow
            </Button>
          }
        />
      </Dialog>
    </Layout>
  );
};

export default HomePage;