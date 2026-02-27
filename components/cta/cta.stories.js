/**
 * @file
 * CTA (Call-to-Action) component stories.
 * Renders the same HTML structure as the Twig template cta.twig
 * 
 * Note: Component CSS is loaded automatically in .storybook/preview.js
 */

/**
 * Renders CTA HTML matching the Twig template output.
 * @param {Object} args - Story args
 * @param {string} args.text - Button/link text
 * @param {string} args.url - Link URL (empty = render as button)
 * @param {string} args.variant - primary | secondary | outline
 * @param {string} args.size - small | medium | large
 * @returns {HTMLElement}
 */
function renderCTA({ text = 'Click here', url = '', variant = 'primary', size = 'medium' }) {
  const classes = ['cta', `cta--${variant}`, `cta--${size}`].join(' ');
  const innerHTML = `<span class="cta__text">${text}</span>`;

  if (url && url.trim() !== '') {
    const a = document.createElement('a');
    a.href = url;
    a.className = classes;
    a.innerHTML = innerHTML;
    return a;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = classes;
  button.innerHTML = innerHTML;
  return button;
}

export default {
  title: 'Puzz/CTA',
  tags: ['autodocs'],
  render: (args) => {
    const el = renderCTA(args);
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
          
          // Generate Twig code with ALL props (including defaults)
          const props = [];
          
          // Always include text (required prop)
          if (args.text !== undefined) {
            props.push(`'text': '${args.text.replace(/'/g, "\\'")}'`);
          }
          
          // Always include url (even if empty, it determines button vs link)
          if (args.url !== undefined) {
            props.push(`'url': '${args.url.replace(/'/g, "\\'")}'`);
          }
          
          // Always include variant (even if default 'primary')
          if (args.variant !== undefined) {
            props.push(`'variant': '${args.variant}'`);
          }
          
          // Always include size (even if default 'medium')
          if (args.size !== undefined) {
            props.push(`'size': '${args.size}'`);
          }
          
          const propsString = props.length > 0 
            ? `{\n    ${props.join(',\n    ')}\n  }`
            : '{}';
          
          // Return only Twig code, ready to copy and paste
          return `{{ {
  '#type': 'component',
  '#component': 'puzz:cta',
  '#props': ${propsString}
} }}`;
        },
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Button or link text',
    },
    url: {
      control: 'text',
      description: 'Link URL. Leave empty to render as a button.',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
      description: 'Button style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
  },
  args: {
    text: 'Click here',
    url: '#',
    variant: 'primary',
    size: 'medium',
  },
};

export const Primary = {
  args: {
    text: 'Primary CTA',
    url: '#',
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary = {
  args: {
    text: 'Secondary CTA',
    url: '#',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Outline = {
  args: {
    text: 'Outline CTA',
    url: '#',
    variant: 'outline',
    size: 'medium',
  },
};

export const AsButton = {
  args: {
    text: 'Submit',
    url: '',
    variant: 'primary',
    size: 'medium',
  },
};

export const Small = {
  args: {
    text: 'Small',
    url: '#',
    variant: 'primary',
    size: 'small',
  },
};

export const Large = {
  args: {
    text: 'Large CTA',
    url: '#',
    variant: 'primary',
    size: 'large',
  },
};
