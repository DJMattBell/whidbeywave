const nextConfig = require('eslint-config-next')

module.exports = [
  ...nextConfig.map((config) => {
    if (config.settings?.react?.version === 'detect') {
      return {
        ...config,
        settings: {
          ...config.settings,
          react: { ...config.settings.react, version: '18' },
        },
      }
    }
    return config
  }),
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\bred-/]',
          message: 'Use terra-* instead of red-*. See DESIGN.md color semantics. Exception: .badge-now in globals.css.',
        },
      ],
    },
  },
]
