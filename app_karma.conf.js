// Karma configuration for scaffnode
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    // You will need (in order):
    //  1) The compiled output of your angular app ('public/media/js/scripts.js' is output from the grunt task `start_app`)
    //  2) Angular-Mocks: https://docs.angularjs.org/api/ngMock
    //  3) Chai.js assertion library (sets up `should()`, `expect()`... etc for tests)
    //  4) The actual frontend unit tests you're going to run (in this case just everything in the `frontend/tests/` folder)
    files: [
        'public/media/js/scripts.js',
        'frontend/bower_components/angular-mocks/angular-mocks.js',
        'node_modules/chai/chai.js',
        'frontend/tests/**/*_tests.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['PhantomJS', 'Chrome', 'Firefox'],
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    client: {
        mocha: {
            reporter: 'html', // change Karma's debug.html to the mocha web reporter
            ui: 'bdd'
        }
    }
  });
};
