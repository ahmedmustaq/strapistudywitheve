import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AnErrorOccurred } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import HomePage from '../HomePage';
import TaskPage from '../TaskPage';

const App = () => {
  return (
    <div>
      <Switch>
        <Route path={`/plugins/${pluginId}`} component={HomePage} exact />
        <Route path={`/plugins/${pluginId}/workflows/:workflowId/tasks`} component={TaskPage} exact />
        <Route component={AnErrorOccurred} />
      </Switch>
    </div>
  );
};

export default App;