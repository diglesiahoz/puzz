/**
 * @file
 * Section component stories.
 */

function renderSection({ content = '<p>Contenido de la sección.</p>' }) {
  const section = document.createElement('section');
  section.className = 'section';
  if (content) {
    const div = document.createElement('div');
    div.className = 'section__content';
    div.innerHTML = content;
    section.appendChild(div);
  }
  return section;
}

export default {
  title: 'Puzz/Section',
  tags: ['autodocs'],
  render: (args) => renderSection(args),
  argTypes: {
    content: { control: 'text', description: 'Contenido HTML de la sección' },
  },
  args: {
    content: '<p>Contenido de la sección.</p>',
  },
};

export const Default = {
  args: {
    content: '<p>Párrafo de ejemplo dentro de la sección.</p>',
  },
};

export const WithHeading = {
  args: {
    content: '<h2>Título de sección</h2><p>Texto debajo del título.</p>',
  },
};
