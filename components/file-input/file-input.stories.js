/**
 * @file
 * File input component stories.
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

function renderFileInput({
  name = 'attachment',
  label = 'Attachment',
  required = false,
  disabled = false,
  multiple = false,
  accept = '',
  help = '',
  error = '',
}) {
  const root = document.createElement('div');
  root.className = `puzz-file-input${error ? ' puzz-file-input--error' : ''}${disabled ? ' puzz-file-input--disabled' : ''}`;

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'puzz-file-input__label';
    labelEl.textContent = label;
    root.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.className = 'puzz-file-input__field';
  input.type = 'file';
  input.name = name;
  input.required = required;
  input.disabled = disabled;
  input.multiple = multiple;
  if (accept) input.accept = accept;
  root.appendChild(input);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-file-input__help';
    helpEl.textContent = help;
    root.appendChild(helpEl);
  }
  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-file-input__error';
    errorEl.textContent = error;
    root.appendChild(errorEl);
  }

  return root;
}

export default {
  title: 'Puzz/File Input',
  tags: ['autodocs'],
  render: (args) => renderFileInput(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:file-input', storyContext.args),
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    accept: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    name: 'attachment',
    label: 'Attachment',
    required: false,
    disabled: false,
    multiple: false,
    accept: '',
    help: '',
    error: '',
  },
};

export const Default = {};
export const MultipleFiles = { args: { multiple: true } };
export const ImageOnly = { args: { accept: 'image/*', help: 'Only image files are allowed.' } };
