// Karma configuration
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      'index.js',
      'test/*.js'
    ],
    browsers: ['Chrome', 'Firefox', 'Safari'],
    reporters: ['progress', 'coverage'],
    preprocessors: {
      'index.js': ['coverage']
    },
    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'}
      ]
    }
  });
};
