/**
 * @file
 * Radio group component stories.
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

function renderRadioGroup({
  legend = 'Contact preference',
  name = 'contact_preference',
  options = [],
  required = false,
  disabled = false,
  help = '',
  error = '',
}) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = `puzz-radio-group${error ? ' puzz-radio-group--error' : ''}${disabled ? ' puzz-radio-group--disabled' : ''}`;

  if (legend) {
    const legendEl = document.createElement('legend');
    legendEl.className = 'puzz-radio-group__legend';
    legendEl.textContent = legend;
    fieldset.appendChild(legendEl);
  }

  const items = document.createElement('div');
  items.className = 'puzz-radio-group__items';
  options.forEach((option) => {
    const label = document.createElement('label');
    label.className = 'puzz-radio-group__option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = option.value || '';
    input.checked = !!option.checked;
    input.disabled = disabled || !!option.disabled;
    input.required = required;
    const text = document.createElement('span');
    text.textContent = option.label || '';
    label.append(input, text);
    items.appendChild(label);
  });
  fieldset.appendChild(items);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-radio-group__help';
    helpEl.textContent = help;
    fieldset.appendChild(helpEl);
  }
  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-radio-group__error';
    errorEl.textContent = error;
    fieldset.appendChild(errorEl);
  }

  return fieldset;
}

export default {
  title: 'Puzz/Radio Group',
  tags: ['autodocs'],
  render: (args) => renderRadioGroup(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:radio-group', storyContext.args),
      },
    },
  },
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
    options: { control: 'object' },
  },
  args: {
    legend: 'Contact preference',
    name: 'contact_preference',
    required: false,
    disabled: false,
    help: '',
    error: '',
    options: [
      { value: 'email', label: 'Email', checked: true },
      { value: 'phone', label: 'Phone' },
      { value: 'sms', label: 'SMS' },
    ],
  },
};

export const Default = {};
export const WithError = { args: { error: 'Please choose one option.' } };
