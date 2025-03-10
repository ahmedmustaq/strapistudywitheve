module.exports = ({ env }) => ({
  //...
  'import-export-entries': {
    enabled: false,
    config: {
      // See `Config` section.
    },
  },
  'documentation': {
    enabled: false,
  },
  'workflow': {
    enabled: true,
    resolve: './src/plugins/workflow'
  },
  'custom-function': {
    enabled: true,
    resolve: './src/plugins/custom-function'
  },
  //...
});