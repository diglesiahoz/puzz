/**
 * @file
 * Textarea component stories.
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
  const props = Object.entries(args)
    .map(([key, value]) => `    '${key}': ${toTwigValue(value)}`);
  const propsString = props.length ? `{\n${props.join(',\n')}\n  }` : '{}';
  return `{{ {\n  '#type': 'component',\n  '#component': '${componentName}',\n  '#props': ${propsString}\n} }}`;
}

function renderTextarea({
  name = 'message',
  label = 'Message',
  value = '',
  rows = 5,
  placeholder = 'Write your message...',
  required = false,
  disabled = false,
  help = '',
  error = '',
}) {
  const root = document.createElement('div');
  const classes = ['puzz-textarea'];
  if (required) classes.push('puzz-textarea--required');
  if (disabled) classes.push('puzz-textarea--disabled');
  if (error) classes.push('puzz-textarea--error');
  root.className = classes.join(' ');

  const id = `story-${name}`;
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'puzz-textarea__label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    root.appendChild(labelEl);
  }

  const field = document.createElement('textarea');
  field.id = id;
  field.name = name;
  field.className = 'puzz-textarea__field';
  field.rows = rows;
  field.placeholder = placeholder;
  field.value = value;
  field.required = required;
  field.disabled = disabled;
  root.appendChild(field);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-textarea__help';
    helpEl.textContent = help;
    root.appendChild(helpEl);
  }

  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-textarea__error';
    errorEl.textContent = error;
    root.appendChild(errorEl);
  }

  return root;
}

export default {
  title: 'Puzz/Textarea',
  tags: ['autodocs'],
  render: (args) => renderTextarea(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:textarea', storyContext.args),
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'text' },
    rows: { control: 'number' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    name: 'message',
    label: 'Message',
    value: '',
    rows: 5,
    placeholder: 'Write your message...',
    required: false,
    disabled: false,
    help: '',
    error: '',
  },
};

export const Default = {};
export const WithHelp = { args: { help: 'You can provide up to 500 characters.' } };
export const WithError = { args: { required: true, error: 'This field is required.' } };
