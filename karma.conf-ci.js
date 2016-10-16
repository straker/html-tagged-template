module.exports = function (config) {
  try {
    require('dotenv').config();
  } catch(e) {

  }

  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
    process.exit(1)
  }

  // Browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/OS combos
  var customLaunchers = {
    OSX_Chrome: {
      base: 'SauceLabs',
      platform: 'OS X 10.11',
      browserName: 'chrome',
    },
    OSX_Firefox: {
      base: 'SauceLabs',
      platform: 'OS X 10.11',
      browserName: 'firefox'
    },
    Windows_Chrome: {
      base: 'SauceLabs',
      platform: 'Windows 10',
      browserName: 'chrome',
    },
    Windows_Edge: {
      base: 'SauceLabs',
      platform: 'Windows 10',
      browserName: 'MicrosoftEdge'
    }
  }

  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      'index.js',
      'test/*.js'
    ],
    reporters: ['progress', 'saucelabs', 'coverage'],
    preprocessors: {
      'index.js': ['coverage']
    },
    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'}
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    sauceLabs: {
      testName: 'http-tagged-template Test Suite',
      recordScreenshots: false,
      connectOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      },
      public: 'public'
    },
    // Increase timeout in case connection in CI is slow
    captureTimeout: 120000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  })
}