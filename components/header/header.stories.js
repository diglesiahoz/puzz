/**
 * @file
 * Header component stories.
 * Renders the same HTML structure as header.twig for Storybook.
 *
 * Note: Component CSS is loaded automatically in .storybook/preview.js
 */

/**
 * Renders Header HTML matching the Twig template output.
 * @param {Object} args - Story args.
 * @returns {HTMLElement}
 */
function renderHeader({
  heading = 'Welcome to Puzz',
  image = '',
  link_url = '#',
  link_title = 'More',
  label_display = 'hidden',
  label_text = '',
}) {
  const root = document.createElement('div');
  root.className = 'header';

  if (label_display === 'above' && label_text) {
    const labelAbove = document.createElement('div');
    labelAbove.className = 'field__label';
    labelAbove.textContent = label_text;
    root.appendChild(labelAbove);
  }

  if (image) {
    const media = document.createElement('div');
    media.className = 'header__media';
    media.innerHTML = image;
    root.appendChild(media);
  }

  if (heading) {
    const title = document.createElement('h1');
    title.className = 'header__caption';
    title.textContent = heading;
    root.appendChild(title);
  }

  if (link_url) {
    const actions = document.createElement('div');
    actions.className = 'header__actions';

    // CTA markup equivalent for Storybook preview.
    const cta = document.createElement('a');
    cta.className = 'cta cta--primary cta--medium';
    cta.href = link_url;
    cta.innerHTML = `<span class="cta__text">${link_title || 'More'}</span>`;
    actions.appendChild(cta);

    root.appendChild(actions);
  }

  if (label_display === 'below' && label_text) {
    const labelBelow = document.createElement('div');
    labelBelow.className = 'field__label';
    labelBelow.textContent = label_text;
    root.appendChild(labelBelow);
  }

  return root;
}

export default {
  title: 'Puzz/Header',
  tags: ['autodocs'],
  render: (args) => renderHeader(args),
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        transform: (code, storyContext) => {
          const { args } = storyContext;
          const props = [];

          if (args.heading !== undefined) {
            props.push(`'heading': '${String(args.heading).replace(/'/g, "\\'")}'`);
          }
          if (args.image !== undefined && args.image !== '') {
            props.push(`'image': '${String(args.image).replace(/'/g, "\\'")}'`);
          }
          if (args.link_url !== undefined && args.link_url !== '') {
            props.push(`'link_url': '${String(args.link_url).replace(/'/g, "\\'")}'`);
          }
          if (args.link_title !== undefined && args.link_title !== '') {
            props.push(`'link_title': '${String(args.link_title).replace(/'/g, "\\'")}'`);
          }
          if (args.label_display !== undefined) {
            props.push(`'label_display': '${String(args.label_display).replace(/'/g, "\\'")}'`);
          }
          if (args.label_text !== undefined && args.label_text !== '') {
            props.push(`'label_text': '${String(args.label_text).replace(/'/g, "\\'")}'`);
          }
          const propsString = props.length > 0
            ? `{\n    ${props.join(',\n    ')}\n  }`
            : '{}';

          return `{{ {
  '#type': 'component',
  '#component': 'puzz:header',
  '#props': ${propsString}
} }}`;
        },
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Main title shown over header media.',
    },
    image: {
      control: 'text',
      description: 'Raw HTML rendered inside .header__media (example: <img ...>).',
    },
    link_url: {
      control: 'text',
      description: 'CTA URL (empty = hide CTA).',
    },
    link_title: {
      control: 'text',
      description: 'CTA label.',
    },
    label_display: {
      control: { type: 'select' },
      options: ['hidden', 'above', 'below'],
      description: 'Field label display mode.',
    },
    label_text: {
      control: 'text',
      description: 'Optional label text for above/below display.',
    },
  },
  args: {
    heading: 'Build better digital experiences',
    image: '<img class="header__image" src="https://picsum.photos/1920/1080?grayscale" alt="Demo header background">',
    link_url: '#',
    link_title: 'Discover more',
    label_display: 'hidden',
    label_text: '',
  },
};

export const Default = {};

export const WithoutImage = {
  args: {
    image: '',
  },
};

export const WithoutCTA = {
  args: {
    link_url: '',
  },
};

export const LabelAbove = {
  args: {
    label_display: 'above',
    label_text: 'Hero label',
  },
};

export const LabelBelow = {
  args: {
    label_display: 'below',
    label_text: 'Hero label',
  },
};
