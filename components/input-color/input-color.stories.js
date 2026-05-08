/**
 * @file
 * Input color component stories.
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

function renderInputColor({
  name = 'theme_color',
  label = 'Theme color',
  value = '#0ea5e9',
  required = false,
  disabled = false,
  help = '',
  error = '',
}) {
  const root = document.createElement('div');
  root.className = `puzz-input-color${error ? ' puzz-input-color--error' : ''}${disabled ? ' puzz-input-color--disabled' : ''}`;

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'puzz-input-color__label';
    labelEl.textContent = label;
    root.appendChild(labelEl);
  }

  const control = document.createElement('div');
  control.className = 'puzz-input-color__control';
  const input = document.createElement('input');
  input.className = 'puzz-input-color__field';
  input.type = 'color';
  input.name = name;
  input.value = value;
  input.required = required;
  input.disabled = disabled;
  const code = document.createElement('code');
  code.className = 'puzz-input-color__value';
  code.textContent = value;
  input.addEventListener('input', () => {
    code.textContent = input.value;
  });
  control.append(input, code);
  root.appendChild(control);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-input-color__help';
    helpEl.textContent = help;
    root.appendChild(helpEl);
  }
  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-input-color__error';
    errorEl.textContent = error;
    root.appendChild(errorEl);
  }
  return root;
}

export default {
  title: 'Puzz/Input Color',
  tags: ['autodocs'],
  render: (args) => renderInputColor(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:input-color', storyContext.args),
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'color' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    name: 'theme_color',
    label: 'Theme color',
    value: '#0ea5e9',
    required: false,
    disabled: false,
    help: '',
    error: '',
  },
};

export const Default = {};
export const WithError = { args: { error: 'Invalid color value.' } };
export const Disabled = { args: { disabled: true } };
export const Required = { args: { required: true, help: 'Choose a brand color.' } };
