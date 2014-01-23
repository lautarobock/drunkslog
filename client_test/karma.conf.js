// Karma configuration
// Generated on Tue Jan 21 2014 08:28:49 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '..',


    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'client/lib/markdown/markdown.min.js',
      // 'client/lib/mousetrap/mousetrap.min.js',
      'client/lib/angular/angular.min.js',
      'client/lib/angular-route/angular-route.min.js',
      'client/lib/angular-resource/angular-resource.min.js',
      'client/lib/angular-sanitize/angular-sanitize.min.js',
      'client/lib/angular-mocks/angular-mocks.js',
      'client/lib/angular-bootstrap/ui-bootstrap.min.js',
      'client/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'client/lib/angular-translate/angular-translate.min.js',
      'client/js/util/util.js',
      // 'client/js/app.js',
      'client_test/test-main.js',
      {pattern: 'client_test/**/*Spec.js', included: false},
      {pattern: 'client/js/**/*.js', included: false},
      {pattern: 'client/lib/mousetrap/mousetrap.min.js', included: false}
    ],


    // list of files to exclude
    exclude: [
      // 'client/js/gplus.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
