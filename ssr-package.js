export const SSRPackageJSON = JSON.stringify({
  name: '@cdui-js/ssr',
  private: true,
  version: '0.0.0',
  type: 'module',
  main: 'server.js',
  devDependencies: {
    express: '^4.21.2',
    commander: '^12.1.0',
    'html-minifier': '^4.0.0',
    'solid-js': '^1.9.10',
  },
  dependencies: {},
});
