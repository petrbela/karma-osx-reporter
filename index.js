var util = require('util');
var spawn = require('child_process').spawn;
var path = require('path');
var http = require('http');

var config_osx = {
  host: "localhost",
  port: 1337
};

var OSXReporter = function(helper, logger, config) {
  var log = logger.create('reporter.osx'),
      lastResult;

  extend(config_osx, config.osxReporter);

  // Start local server that will send messages to Notification Center
  var center = spawn(require.resolve('node-osx-notifier'), [config_osx.port, config_osx.host]);
  log.info("OSX Notification Center reporter started at http://%s:%s", config_osx.host, config_osx.port);
  center.on('exit', function(code) {
      log.info('node-osx-notifier exited with code ' + code);
  });

  this.adapters = [];

  this.onBrowserComplete = function(browser) {
    report(browser.lastResult, browser);
  };

  this.onRunComplete = function(browsers, results) {
    if (browsers.length <= 1 || results.disconnected) { return; }

    report(results);
  };
  
  function showNotification(result) {
    var show = false;

    // If this is the first run `lastResult` will be undefined and we show
    // the notification to confirm that the process is running.
    if (lastResult === undefined) {
      lastResult = result;
      return true;
    }

    switch (config_osx.notificationMode) {
      case 'always':
        show = true;
        break;

      case 'change':
        show = result !== lastResult;
        break;

      case 'failChange':
        if (result === 'fail' || (result === 'pass' && lastResult === 'fail')) {
          show = true;
        }
        break;

      case 'failOnly':
        show = result === 'fail';
        break;

      default: show = true;
    }

    lastResult = result;
    return show;
  }

  function report(results, browser) {
    var str_request, title, message, uri;
    var time = helper.formatTimeInterval(results.totalTime);

    if (results.disconnected || results.error) {
      str_request = 'fail';
      title = util.format('ERROR - %s', browser.name);
      message = 'Test error';
    }
    else if (results.failed) {
      str_request = 'fail';
      if (browser) {
        title = util.format('FAILED - %s', browser.name);
        message = util.format('%d/%d tests failed in %s.', results.failed, results.total, time);
      } else {
        title = util.format('TOTAL FAILED: %s', results.failed);
        message = util.format('%d/%d tests failed', results.failed, results.success + results.failed);
      }
    } else {
      str_request = 'pass';
      if (browser) {
        title = util.format('PASSED - %s', browser.name);
        message = util.format('%d tests passed in %s.', results.success, time);
      } else {
        title = util.format('TOTAL PASSED: %s', results.success);
        message = util.format('%d tests passed.', results.success);
      }
    }

    if (showNotification(str_request)) {
      uri = '/' + str_request + "?title=" + encodeURIComponent(title) + "&message=" + encodeURIComponent(message);

      Object.keys(config_osx).forEach(function(key) {
        if (key !== 'host' && key !== 'port') {
          var value = typeof config_osx[key] === 'function' ? config_osx[key](results, browser) : config_osx[key];
          uri += '&' + key + '=' + encodeURIComponent(value);
        }
      });
    }

    var options = {
      host: config_osx.host,
      port: config_osx.port,
      path: uri,
      method: 'GET'
    };

    var req = http.request(options, null);
    req.on('error', function(err) {
      log.error('error: ' + err.message);
    });
    req.end();
  }
};

if (process.platform !== 'darwin') {
  // overwrite reporter with void function for non-OSX
  OSXReporter = function(helper, logger) {};
}

OSXReporter.$inject = ['helper', 'logger', 'config'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:osx': ['type', OSXReporter]
};


function extend(obj) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
}
