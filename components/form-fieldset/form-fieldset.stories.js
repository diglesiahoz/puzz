/**
 * @file
 * Form fieldset component stories.
 */

function toTwigValue(value) {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => toTwigValue(item)).join(', ')}]`;
  }
  if (value && typeof value === 'object') {
    const pairs = Object.entries(value).map(([key, item]) => `'${key}': ${toTwigValue(item)}`);
    return `{ ${pairs.join(', ')} }`;
  }
  return "''";
}

function toTwigComponentCode(componentName, args) {
  const props = Object.entries(args).map(([key, value]) => `    '${key}': ${toTwigValue(value)}`);
  const propsString = props.length ? `{\n${props.join(',\n')}\n  }` : '{}';
  return `{{ {\n  '#type': 'component',\n  '#component': '${componentName}',\n  '#props': ${propsString}\n} }}`;
}

function renderFormFieldset({
  legend = 'Fieldset title',
  description = '',
  description_display = 'after',
  required = false,
  errors = '',
  children = '<p>Fieldset content goes here.</p>',
}) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'puzz-form-fieldset';

  if (legend) {
    const legendEl = document.createElement('legend');
    legendEl.className = 'puzz-form-fieldset__legend';
    legendEl.textContent = legend;
    if (required) {
      const star = document.createElement('span');
      star.className = 'puzz-form-fieldset__required-indicator';
      star.textContent = '*';
      legendEl.appendChild(star);
    }
    fieldset.appendChild(legendEl);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'puzz-form-fieldset__wrapper';

  if (description && description_display === 'before') {
    const desc = document.createElement('div');
    desc.className = 'puzz-form-fieldset__description';
    desc.textContent = description;
    wrapper.appendChild(desc);
  }

  if (errors) {
    const error = document.createElement('div');
    error.className = 'puzz-form-fieldset__error';
    error.innerHTML = `<strong>${errors}</strong>`;
    wrapper.appendChild(error);
  }

  const content = document.createElement('div');
  content.innerHTML = children;
  wrapper.appendChild(content);

  if (description && description_display !== 'before') {
    const desc = document.createElement('div');
    desc.className = 'puzz-form-fieldset__description';
    desc.textContent = description;
    wrapper.appendChild(desc);
  }

  fieldset.appendChild(wrapper);
  return fieldset;
}

export default {
  title: 'Puzz/Form Fieldset',
  tags: ['autodocs'],
  render: (args) => renderFormFieldset(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:form-fieldset', storyContext.args),
      },
    },
  },
  argTypes: {
    legend: { control: 'text' },
    description: { control: 'text' },
    description_display: { control: { type: 'select' }, options: ['before', 'after', 'invisible'] },
    required: { control: 'boolean' },
    errors: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    legend: 'Fieldset title',
    description: 'Group related controls in this fieldset.',
    description_display: 'after',
    required: false,
    errors: '',
    children: '<label><input type="text" placeholder="Example input"></label>',
  },
};

export const Default = {};
export const WithError = { args: { errors: 'This fieldset contains errors.' } };
export const DescriptionBefore = { args: { description_display: 'before' } };
export const Required = { args: { required: true } };
