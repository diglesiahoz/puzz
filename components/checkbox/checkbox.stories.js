/**
 * @file
 * Checkbox component stories.
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

function renderCheckbox({
  name = 'terms',
  label = 'Accept terms and conditions',
  value = '1',
  checked = false,
  required = false,
  disabled = false,
  help = '',
  error = '',
}) {
  const wrapper = document.createElement('div');
  wrapper.className = `puzz-checkbox${error ? ' puzz-checkbox--error' : ''}${disabled ? ' puzz-checkbox--disabled' : ''}`;

  const labelEl = document.createElement('label');
  labelEl.className = 'puzz-checkbox__label';
  const input = document.createElement('input');
  input.className = 'puzz-checkbox__field';
  input.type = 'checkbox';
  input.name = name;
  input.value = value;
  input.checked = checked;
  input.required = required;
  input.disabled = disabled;
  const text = document.createElement('span');
  text.className = 'puzz-checkbox__text';
  text.textContent = label;
  labelEl.append(input, text);
  wrapper.appendChild(labelEl);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-checkbox__help';
    helpEl.textContent = help;
    wrapper.appendChild(helpEl);
  }
  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-checkbox__error';
    errorEl.textContent = error;
    wrapper.appendChild(errorEl);
  }

  return wrapper;
}

export default {
  title: 'Puzz/Checkbox',
  tags: ['autodocs'],
  render: (args) => renderCheckbox(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:checkbox', storyContext.args),
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'text' },
    checked: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    name: 'terms',
    label: 'Accept terms and conditions',
    value: '1',
    checked: false,
    required: false,
    disabled: false,
    help: '',
    error: '',
  },
};

export const Default = {};
export const Checked = { args: { checked: true } };
export const WithError = { args: { error: 'This checkbox is required.' } };
