import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Layout, BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Box } from '@strapi/design-system/Box';
import { Button } from '@strapi/design-system/Button';
import { Alert } from '@strapi/design-system/Alert';
import Plus from '@strapi/icons/Plus';
import ArrowLeft from '@strapi/icons/ArrowLeft';
import { useFetchClient } from '@strapi/helper-plugin';
import TaskList from '../../components/TaskList';
import TaskDialog from '../../components/TaskDialog';
import { ApiConfigForm, ConditionConfigForm, CodeSnippetConfigForm } from '../../components/TaskConfigForms';

const TASK_TYPES = {
  api: { value: 'api', label: 'API' },
  condition: { value: 'condition', label: 'Condition' },
  code_snippet: { value: 'code_snippet', label: 'Code Snippet' }
};

const TaskPage = () => {
  const { workflowId } = useParams();
  const history = useHistory();
  const [workflow, setWorkflow] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskData, setTaskData] = useState({ 
    name: '', 
    type: '', 
    config: {},
    taskparams: []
  });
  const { post, get, del, put } = useFetchClient();

  const fetchWorkflowAndTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [workflowResponse, tasksResponse] = await Promise.all([
        get(`/workflow/workflows/${workflowId}`),
        get(`/workflow/tasks?workflow=${workflowId}`)
      ]);
      
      setWorkflow(workflowResponse.data);
      setTasks(tasksResponse.data || []);
    } catch (error) {
      console.error('Error fetching workflow and tasks:', error);
      setError('Failed to load workflow and tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowAndTasks();
  }, [workflowId]);

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingTask) {
        await put(`/workflow/tasks/${editingTask.id}`, taskData);
      } else {
        await post('/workflow/tasks', { ...taskData, workflow: workflowId });
      }
      setIsVisible(false);
      fetchWorkflowAndTasks();
      setTaskData({ name: '', type: '', config: {}, taskparams: [] });
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      setError(`Failed to ${editingTask ? 'update' : 'create'} task. Please try again.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await del(`/workflow/tasks/${id}`);
      fetchWorkflowAndTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskData({
      name: task.name,
      type: task.type,
      config: task.config || {},
      taskparams: task.taskparams || []
    });
    setIsVisible(true);
  };

  const closeDialog = () => {
    setIsVisible(false);
    setEditingTask(null);
    setTaskData({ name: '', type: '', config: {}, taskparams: [] });
  };

  const renderConfigForm = (type) => {
    const props = {
      config: taskData.config,
      onChange: (newConfig) => setTaskData(prev => ({ ...prev, config: newConfig }))
    };

    switch (type) {
      case 'api':
        return <ApiConfigForm {...props} />;
      case 'condition':
        return <ConditionConfigForm {...props} />;
      case 'code_snippet':
        return <CodeSnippetConfigForm {...props} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <BaseHeaderLayout
        navigationAction={
          <Button 
            startIcon={<ArrowLeft />} 
            variant="tertiary" 
            onClick={() => history.push('/plugins/workflow')}
          >
            Back to workflows
          </Button>
        }
        title={workflow ? `Tasks for ${workflow.name}` : 'Tasks'}
        subtitle="Manage workflow tasks"
        as="h2"
        primaryAction={
          <Button startIcon={<Plus />} onClick={() => setIsVisible(true)}>
            Add new task
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
          <TaskList 
            tasks={tasks}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={() => setIsVisible(true)}
          />
        </Box>

        <TaskDialog
          isOpen={isVisible}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          taskData={taskData}
          onTaskDataChange={setTaskData}
          editingTask={editingTask}
          renderConfigForm={renderConfigForm}
          taskTypes={TASK_TYPES}
        />
      </ContentLayout>
    </Layout>
  );
};

export default TaskPage;