/**
 * @file
 * Input form component stories.
 * Renders the same HTML structure as the Twig template input.twig
 *
 * Note: Component CSS is loaded automatically in .storybook/preview.js
 */

/**
 * Renders Input HTML matching the Twig template output.
 * @param {Object} args - Story args
 * @param {string} args.name - Input name attribute
 * @param {string} args.label - Visible label
 * @param {string} args.type - HTML input type
 * @param {string} args.value - Current value
 * @param {string} args.placeholder - Placeholder text
 * @param {boolean} args.required - Whether the field is required
 * @param {boolean} args.disabled - Whether the field is disabled
 * @param {string} args.error - Error message
 * @param {string} args.help - Help text
 * @returns {HTMLElement}
 */
function renderInput({
  name = 'email',
  label = 'Email',
  type = 'email',
  value = '',
  placeholder = 'you@example.com',
  required = false,
  disabled = false,
  error = '',
  help = '',
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'puzz-input';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'puzz-input__label';
    labelEl.appendChild(document.createTextNode(label));
    if (required) {
      const span = document.createElement('span');
      span.className = 'puzz-input__required-indicator';
      span.textContent = '*';
      labelEl.appendChild(span);
    }
    wrapper.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.className = 'puzz-input__field';
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  if (value) {
    input.value = value;
  }
  if (required) {
    input.required = true;
  }
  if (disabled) {
    input.disabled = true;
  }
  wrapper.appendChild(input);

  if (help) {
    const helpEl = document.createElement('p');
    helpEl.className = 'puzz-input__help';
    helpEl.textContent = help;
    wrapper.appendChild(helpEl);
  }

  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'puzz-input__error';
    errorEl.textContent = error;
    wrapper.classList.add('puzz-input--error');
    wrapper.appendChild(errorEl);
  }

  return wrapper;
}

export default {
  title: 'Puzz/Input',
  tags: ['autodocs'],
  render: (args) => {
    const el = renderInput(args);
    const wrapper = document.createElement('div');
    wrapper.style.padding = '1rem';
    wrapper.appendChild(el);
    return wrapper;
  },
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => {
          const { args } = storyContext;

          const props = [];

          if (args.name !== undefined) {
            props.push(`'name': '${String(args.name).replace(/'/g, "\\'")}'`);
          }
          if (args.label !== undefined) {
            props.push(`'label': '${String(args.label).replace(/'/g, "\\'")}'`);
          }
          if (args.type !== undefined) {
            props.push(`'type': '${String(args.type).replace(/'/g, "\\'")}'`);
          }
          if (args.value !== undefined && args.value !== '') {
            props.push(`'value': '${String(args.value).replace(/'/g, "\\'")}'`);
          }
          if (args.placeholder !== undefined && args.placeholder !== '') {
            props.push(`'placeholder': '${String(args.placeholder).replace(/'/g, "\\'")}'`);
          }
          if (args.required !== undefined && args.required) {
            props.push(`'required': true`);
          }
          if (args.disabled !== undefined && args.disabled) {
            props.push(`'disabled': true`);
          }
          if (args.help !== undefined && args.help !== '') {
            props.push(`'help': '${String(args.help).replace(/'/g, "\\'")}'`);
          }
          if (args.error !== undefined && args.error !== '') {
            props.push(`'error': '${String(args.error).replace(/'/g, "\\'")}'`);
          }

          const propsString = props.length > 0
            ? `{\n    ${props.join(',\n    ')}\n  }`
            : '{}';

          return `{{ {\n  '#type': 'component',\n  '#component': 'puzz:input',\n  '#props': ${propsString}\n} }}`;
        },
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Input name attribute',
    },
    label: {
      control: 'text',
      description: 'Visible label text',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'HTML input type',
    },
    value: {
      control: 'text',
      description: 'Current value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    help: {
      control: 'text',
      description: 'Optional help text',
    },
    error: {
      control: 'text',
      description: 'Validation error message',
    },
  },
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    value: '',
    placeholder: 'you@example.com',
    required: false,
    disabled: false,
    help: '',
    error: '',
  },
};

export const Default = {
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const WithHelp = {
  args: {
    name: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search...',
    help: 'Type a keyword and press Enter.',
  },
};

export const WithError = {
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    value: 'not-an-email',
    error: 'Please enter a valid email address.',
  },
};

export const Disabled = {
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    disabled: true,
  },
};

export const Required = {
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
};

