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
]
