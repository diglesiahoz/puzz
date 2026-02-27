module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-sorting')({
      order: [
        'custom-properties',
        'declarations',
        'rules',
        'at-rules',
      ],
      'properties-order': 'alphabetical',
      'unspecified-properties-position': 'bottom'
    })
  ]
};
