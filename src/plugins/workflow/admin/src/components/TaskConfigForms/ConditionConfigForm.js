import React from 'react';
import { Stack } from '@strapi/design-system/Stack';
import { TextInput } from '@strapi/design-system/TextInput';
import { Select, Option } from '@strapi/design-system/Select';
import { Textarea } from '@strapi/design-system/Textarea';

const OPERATORS = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains'];

const ConditionConfigForm = ({ config, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label="Field"
        name="field"
        onChange={e => handleChange('field', e.target.value)}
        value={config.field || ''}
        placeholder="Enter field name"
        required
      />
      <Select
        label="Operator"
        value={config.operator || 'equals'}
        onChange={value => handleChange('operator', value)}
        required
      >
        {OPERATORS.map(operator => (
          <Option key={operator} value={operator}>
            {operator.replace('_', ' ')}
          </Option>
        ))}
      </Select>
      <TextInput
        label="Value"
        name="value"
        onChange={e => handleChange('value', e.target.value)}
        value={config.value || ''}
        placeholder="Enter comparison value"
        required
      />
      <Textarea
        label="Description"
        name="description"
        onChange={e => handleChange('description', e.target.value)}
        value={config.description || ''}
        placeholder="Enter condition description"
      />
    </Stack>
  );
};

export default ConditionConfigForm;