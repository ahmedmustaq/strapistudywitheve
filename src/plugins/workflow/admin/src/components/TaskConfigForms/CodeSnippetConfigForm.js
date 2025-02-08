import React from 'react';
import { Stack } from '@strapi/design-system/Stack';
import { Textarea } from '@strapi/design-system/Textarea';
import { Select, Option } from '@strapi/design-system/Select';

const LANGUAGES = ['javascript', 'python', 'shell'];

const CodeSnippetConfigForm = ({ config, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Stack spacing={4}>
      <Select
        label="Language"
        value={config.language || 'javascript'}
        onChange={value => handleChange('language', value)}
        required
      >
        {LANGUAGES.map(lang => (
          <Option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </Option>
        ))}
      </Select>
      <Textarea
        label="Code"
        name="code"
        onChange={e => handleChange('code', e.target.value)}
        value={config.code || ''}
        placeholder="Enter your code here"
        required
      />
      <Textarea
        label="Description"
        name="description"
        onChange={e => handleChange('description', e.target.value)}
        value={config.description || ''}
        placeholder="Enter code description"
      />
    </Stack>
  );
};

export default CodeSnippetConfigForm;