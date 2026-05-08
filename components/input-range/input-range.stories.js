/**
 * @file
 * Input range component stories.
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

function renderInputRange({
  name = 'score',
  label = 'Score',
  value = 30,
  min = 0,
  max = 100,
  step = 1,
  required = false,
  disabled = false,
  help = '',
  error = '',
}) {
  const root = document.createElement('div');
  root.className = `puzz-input-range${error ? ' puzz-input-range--error' : ''}${disabled ? ' puzz-input-range--disabled' : ''}`;

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'puzz-input-range__label';
    labelEl.textContent = label;
    root.appendChild(labelEl);
  }

  const control = document.createElement('div');
  control.className = 'puzz-input-range__control';
  const input = document.createElement('input');
  input.className = 'puzz-input-range__field';
  input.type = 'range';
  input.name = name;
  input.value = value;
  input.min = min;
  input.max = max;
  input.step = step;
  input.required = required;
  input.disabled = disabled;
  const output = document.createElement('output');
  output.className = 'puzz-input-range__value';
  output.textContent = String(value);
  input.addEventListener('input', () => {
    output.textContent = input.value;
  });
  control.append(input, output);
  root.appendChild(control);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-input-range__help';
    helpEl.textContent = help;
    root.appendChild(helpEl);
  }
  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-input-range__error';
    errorEl.textContent = error;
    root.appendChild(errorEl);
  }
  return root;
}

export default {
  title: 'Puzz/Input Range',
  tags: ['autodocs'],
  render: (args) => renderInputRange(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:input-range', storyContext.args),
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    name: 'score',
    label: 'Score',
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    required: false,
    disabled: false,
    help: '',
    error: '',
  },
};

export const Default = {};
export const WithError = { args: { error: 'Value out of range.' } };
export const Disabled = { args: { disabled: true } };
export const Required = { args: { required: true, help: 'Required slider.' } };
