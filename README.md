# karma-osx-reporter

> Reporter using Mac OS 10.8+ Notification Center to display results.

![image](http://f.cl.ly/items/2T350d1c0H30460U3W2Y/Screen%20Shot%202013-08-06%20at%201.46.47%20PM.png)

Built on top of [node-osx-notifier] and based on [AvnerCohen's code].

Works with **Karma 0.9 or later**.

For more information on Karma see the [homepage].


## Installation

1. Install Karma and karma-osx-reporter plugin.

  a. Globally. System-wide with `karma` available on command line.

    ```sh
    npm install -g karma
    npm install -g karma-osx-reporter
    ```

  b. Locally to your project (preferred). Simply run:

    ```sh
    npm install karma --save-dev
    npm install karma-osx-reporter --save-dev
    ```

    or add the dependencies to `package.json` manually and run `npm install`:

    ```js
    "devDependencies": {
      "karma": ">=0.9",
      "karma-osx-reporter": "*"
    }
    ```

    If you install locally, you'll need to run Karma using `node_modules/karma/bin/karma`.

  In any case, the plugin needs to be installed as a peer dependency to Karma (i.e. in the sibling folder). This just means you cannot use global Karma with local plugins or vice-versa.


2. Add it as a reporter in the config file

  ```js
  reporters: ['progress', 'osx']
  ```

  or pass through the command line

  ```sh
  $ karma start --reporters=progress,osx karma.conf.js
  ```

## Configuration

### Host and Port

OSX Notifier runs on localhost:1337 by default. If you need to change that, simply override it in the Karma config file.

```js
config.set({
  osxReporter: {
    host: "localhost",
    port: 1337
  }
});
```

### Notification Mode

- `always` - always show a notification
- `change` - show a notification when the current result is different than the last
- `failOnly` - show a notification if the result is fail
- `failChange` - show a notification when the result is fail or first success after fail

```js
config.set({
  osxReporter: {
    notificationMode: 'always'
  }
})
```

### Additional Options

Any additional parameter will be passed to [node-osx-notifier](https://github.com/azoff/node-osx-notifier). Check the documentation for details. Some examples:

```js
config.set({
  osxReporter: {
    activate: 'com.apple.Terminal',
    open: 'http://google.com',
    execute: 'open .'
  }
});
```

To decide dynamically what to pass into these options, define them as functions:

```js
config.set({
  osxReporter: {
    activate: function(results, browser) {
      return results.failed > 0 ? 'com.apple.Terminal' : 'com.apple.Safari';
    }
  }
});
```


## License

MIT License


[node-osx-notifier]: https://github.com/azoff/node-osx-notifier
[AvnerCohen's code]: https://github.com/karma-runner/karma/commit/ffd48a7f9aa7bc9a27516393d4d592edc6b628f7
[homepage]: http://karma-runner.github.io
