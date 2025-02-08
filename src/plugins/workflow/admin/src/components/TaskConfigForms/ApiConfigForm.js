import React from 'react';
import { Stack } from '@strapi/design-system/Stack';
import { TextInput } from '@strapi/design-system/TextInput';
import { Select, Option } from '@strapi/design-system/Select';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const ApiConfigForm = ({ config, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label="API Endpoint"
        name="endpoint"
        onChange={e => handleChange('endpoint', e.target.value)}
        value={config.endpoint || ''}
        placeholder="Enter API endpoint"
        required
      />
      <Select
        label="HTTP Method"
        value={config.method || 'GET'}
        onChange={value => handleChange('method', value)}
        required
      >
        {HTTP_METHODS.map(method => (
          <Option key={method} value={method}>
            {method}
          </Option>
        ))}
      </Select>
      <TextInput
        label="Headers"
        name="headers"
        onChange={e => handleChange('headers', e.target.value)}
        value={config.headers || ''}
        placeholder="Enter headers as JSON"
      />
      <TextInput
        label="Body"
        name="body"
        onChange={e => handleChange('body', e.target.value)}
        value={config.body || ''}
        placeholder="Enter request body as JSON"
      />
    </Stack>
  );
};

export default ApiConfigForm;