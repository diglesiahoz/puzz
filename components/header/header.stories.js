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
  caption = 'Welcome to Puzz',
  image = '',
  link_url = '#',
  link_title = 'More',
}) {
  const root = document.createElement('div');
  root.className = 'header';

  if (image) {
    const media = document.createElement('div');
    media.className = 'header__media';
    media.innerHTML = image;
    root.appendChild(media);
  }

  if (caption) {
    const title = document.createElement('h1');
    title.className = 'header__caption';
    title.textContent = caption;
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

  return root;
}

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
  const propsString = props.length > 0 ? `{\n${props.join(',\n')}\n  }` : '{}';
  return `{{ {\n  '#type': 'component',\n  '#component': '${componentName}',\n  '#props': ${propsString}\n} }}`;
}

export default {
  title: 'Puzz/Header',
  tags: ['autodocs'],
  render: (args) => renderHeader(args),
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        transform: (code, storyContext) => toTwigComponentCode('puzz:header', storyContext.args),
      },
    },
  },
  argTypes: {
    caption: {
      control: 'text',
      description: 'Main title shown over header media (mapped from field_puzz_header_caption).',
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
  },
  args: {
    caption: 'Build better digital experiences',
    image: '<img class="header__image" src="https://picsum.photos/1920/1080?grayscale" alt="Demo header background">',
    link_url: '#',
    link_title: 'Discover more',
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
