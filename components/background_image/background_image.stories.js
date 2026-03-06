/**
 * @file
 * Background image component stories.
 * Misma estructura que el Twig del componente.
 */

function renderBackgroundImage({
  image_url = '/core/themes/olivero/images/background-image.svg',
  image_alt = 'Decorative background',
  content = '',
  overlay = 'none',
}) {
  const classes = ['background-image'];
  if (overlay && overlay !== 'none') {
    classes.push(`background-image--overlay-${overlay}`);
  }
  const div = document.createElement('div');
  div.className = classes.join(' ');
  if (image_url) {
    div.style.setProperty('--background-image-url', `url(${image_url})`);
  }
  const imageDiv = document.createElement('div');
  imageDiv.className = 'background-image__image';
  imageDiv.setAttribute('role', 'img');
  if (image_alt) {
    imageDiv.setAttribute('aria-label', image_alt);
  }
  div.appendChild(imageDiv);
  if (content) {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'background-image__content';
    contentDiv.innerHTML = content;
    div.appendChild(contentDiv);
  }
  return div;
}

export default {
  title: 'Puzz/Background image',
  tags: ['autodocs'],
  render: (args) => {
    const el = renderBackgroundImage(args);
    const wrapper = document.createElement('div');
    wrapper.style.minWidth = '320px';
    wrapper.appendChild(el);
    return wrapper;
  },
  parameters: {
    docs: {
      source: {
        transform: (code, storyContext) => {
          const { args } = storyContext;
          const props = [];
          if (args.image_url !== undefined) {
            props.push(`'image_url': '${(args.image_url || '').replace(/'/g, "\\'")}'`);
          }
          if (args.image_alt !== undefined) {
            props.push(`'image_alt': '${(args.image_alt || '').replace(/'/g, "\\'")}'`);
          }
          if (args.content !== undefined && args.content !== '') {
            props.push(`'content': '${(args.content || '').replace(/'/g, "\\'")}'`);
          }
          if (args.overlay !== undefined && args.overlay !== 'none') {
            props.push(`'overlay': '${args.overlay}'`);
          }
          const propsString = props.length > 0
            ? `{\n    ${props.join(',\n    ')}\n  }`
            : '{}';
          return `{{ {
  '#type': 'component',
  '#component': 'puzz:background_image',
  '#props': ${propsString}
} }}`;
        },
      },
    },
  },
  argTypes: {
    image_url: { control: 'text', description: 'URL de la imagen de fondo' },
    image_alt: { control: 'text', description: 'Texto alternativo' },
    content: { control: 'text', description: 'Contenido sobre la imagen' },
    overlay: {
      control: { type: 'select' },
      options: ['none', 'dark', 'light'],
      description: 'Overlay sobre la imagen',
    },
  },
  args: {
    image_url: '/core/themes/olivero/images/background-image.svg',
    image_alt: 'Decorative background',
    content: '',
    overlay: 'none',
  },
};

export const Default = {
  args: {
    image_url: '/core/themes/olivero/images/background-image.svg',
    image_alt: 'Background',
    content: '',
    overlay: 'none',
  },
};

export const WithContent = {
  args: {
    image_url: '/core/themes/olivero/images/background-image.svg',
    image_alt: 'Background',
    content: '<p style="color: #fff; font-size: 1.5rem;">Contenido sobre la imagen</p>',
    overlay: 'dark',
  },
};

export const OverlayDark = {
  args: {
    image_url: '/core/themes/olivero/images/background-image.svg',
    image_alt: 'Background',
    content: '<p style="color: #fff;">Overlay oscuro</p>',
    overlay: 'dark',
  },
};

export const OverlayLight = {
  args: {
    image_url: '/core/themes/olivero/images/background-image.svg',
    image_alt: 'Background',
    content: '<p style="color: #333;">Overlay claro</p>',
    overlay: 'light',
  },
};
