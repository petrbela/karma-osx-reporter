var util = require('util');
var spawn = require('child_process').spawn;
var path = require('path');
var http = require('http');
var root = __dirname;

var config_osx = {
  host: "localhost",
  port: 1337
}

var OSXReporter = function(helper, logger, config) {
  var log = logger.create('reporter.osx');

  extend(config_osx, config.osxReporter);

  // Start local server that will send messages to Notification Center
  var center = spawn(path.join(root, "/node_modules/node-osx-notifier/lib/node-osx-notifier.js"), [config_osx.port, config_osx.host]);
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

  function report(results, browser) {
    var str_request, title, message;
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

    var uri = '/' + str_request + "?title=" + encodeURIComponent(title) + "&message=" + encodeURIComponent(message);

    Object.keys(config_osx).forEach(function(key) {
      if (key !== 'host' && key !== 'port') {
        var value = typeof config_osx[key] === 'function' ? config_osx[key](results, browser) : config_osx[key];
        uri += '&' + key + '=' + encodeURIComponent(value);
      }
    });

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

OSXReporter.$inject = ['helper', 'logger', 'config'];

var UbuntuReporter = function(helper, logger) {
  var log = logger.create('reporter.ubuntu');

  var notifications = null;
  var notificationId = 0;

  var sessionBus = require('dbus-native').sessionBus();
  sessionBus.getService('org.freedesktop.Notifications').getInterface(
    '/org/freedesktop/Notifications',
    'org.freedesktop.Notifications',
    function(err, service) {
      notifications = service;
    }
  );

  this.onBrowserComplete = function(browser) {
    var results = browser.lastResult;
    var time = helper.formatTimeInterval(results.totalTime);

    var icon = null,
    title = null,
    message = null;

    log.debug(results);

    if (results.failed) {
      icon = 'dialog-error';
      title = util.format('FAILED - %s', browser.name);
      message = util.format('%d/%d tests failed in %s.', results.failed, results.total, time);
    }
    else if (results.disconnected || results.error) {
      icon = 'face-crying';
      title = util.format('ERROR - %s', browser.name);
      message = 'Test error';
    }
    else {
      icon = 'emblem-default'; // Currently, this is a green tick mark. Didn't find better stock id.
      title = util.format('PASSED - %s', browser.name);
      message = util.format('%d tests passed in %s.', results.success, time);
    }

    if (notifications) {
      notifications.Notify('', notificationId, icon, title, message, [], [], 5, function(err, id) {
        notificationId = id;
      });
    } else {
      log.info("Notification service not ready yet");
    }
  };
};

UbuntuReporter.$inject = ['helper', 'logger'];

var notificationClass;

if (process.platform === 'darwin') {
  notificationClass = OSXReporter;
} else {
  notificationClass = UbuntuReporter;
}

// PUBLISH DI MODULE
module.exports = {
  'reporter:notification': ['type', notificationClass]
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
