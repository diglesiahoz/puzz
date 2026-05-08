/**
 * @file
 * Select component stories.
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

function renderSelect({
  name = 'country',
  label = 'Country',
  required = false,
  disabled = false,
  multiple = false,
  options = [],
  help = '',
  error = '',
}) {
  const root = document.createElement('div');
  const classes = ['puzz-select'];
  if (required) classes.push('puzz-select--required');
  if (disabled) classes.push('puzz-select--disabled');
  if (error) classes.push('puzz-select--error');
  root.className = classes.join(' ');

  const id = `story-${name.replace(/[^a-z0-9-_]/gi, '-')}`;
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'puzz-select__label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    root.appendChild(labelEl);
  }

  const select = document.createElement('select');
  select.id = id;
  select.name = name;
  select.className = 'puzz-select__field';
  select.disabled = disabled;
  select.required = required;
  select.multiple = multiple;

  options.forEach((option) => {
    if (option.type === 'optgroup') {
      const group = document.createElement('optgroup');
      group.label = option.label || '';
      (option.options || []).forEach((subOption) => {
        const item = document.createElement('option');
        item.value = subOption.value || '';
        item.textContent = subOption.label || '';
        if (subOption.selected) item.selected = true;
        group.appendChild(item);
      });
      select.appendChild(group);
      return;
    }

    const item = document.createElement('option');
    item.value = option.value || '';
    item.textContent = option.label || '';
    if (option.selected) item.selected = true;
    select.appendChild(item);
  });
  root.appendChild(select);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-select__help';
    helpEl.textContent = help;
    root.appendChild(helpEl);
  }

  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-select__error';
    errorEl.textContent = error;
    root.appendChild(errorEl);
  }

  return root;
}

const baseOptions = [
  { type: 'option', value: '', label: 'Select an option' },
  { type: 'option', value: 'es', label: 'Spain' },
  { type: 'option', value: 'fr', label: 'France' },
  { type: 'option', value: 'de', label: 'Germany' },
];

export default {
  title: 'Puzz/Select',
  tags: ['autodocs'],
  render: (args) => renderSelect(args),
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:select', storyContext.args),
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
    options: { control: 'object' },
  },
  args: {
    name: 'country',
    label: 'Country',
    required: false,
    disabled: false,
    multiple: false,
    options: baseOptions,
    help: '',
    error: '',
  },
};

export const Default = {};
export const WithOptGroup = {
  args: {
    options: [
      { type: 'option', value: '', label: 'Select one' },
      {
        type: 'optgroup',
        label: 'Europe',
        options: [
          { value: 'es', label: 'Spain' },
          { value: 'fr', label: 'France', selected: true },
        ],
      },
      {
        type: 'optgroup',
        label: 'America',
        options: [
          { value: 'mx', label: 'Mexico' },
          { value: 'ar', label: 'Argentina' },
        ],
      },
    ],
  },
};
export const Multiple = {
  args: {
    multiple: true,
    options: [
      { type: 'option', value: 'a', label: 'Option A', selected: true },
      { type: 'option', value: 'b', label: 'Option B' },
      { type: 'option', value: 'c', label: 'Option C', selected: true },
    ],
  },
};
