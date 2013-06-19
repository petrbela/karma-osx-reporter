# karma-osx-reporter

> Reporter using Mac OS 10.8+ Notification Center to display results.

Built on top of [node-osx-notifier] and based on [AvnerCohen's code].

Only works with **Karma 0.9 or later** which enables custom plugins.

For more information on Karma see the [homepage].


## Installation

0. Make sure you're using Karma 0.9+ `karma --version`. You may install the latest (unstable) version using `npm install -g karma@canary`

1. Install the plugin `npm install -g karma-osx-reporter`.

2. Add dependency to the plugin section in Karma config file (Karma 0.9.0 - 0.9.2):

```js
  plugins = [
    'karma-osx-reporter'
  ];
```
or, if you're using the new module-based config file format (Karma 0.9.3+):

```js
  karma.configure({
    ...
    plugins: [
      'karma-osx-reporter'
    ],
    ...
  })
```

4\. Define it as a reporter in the config file

```js
  reporters = ['osx']
```

or pass through the command line

```bash
  $ karma start --reporters osx karma.conf.js
```



## License

MIT License


[node-osx-notifier]: https://github.com/azoff/node-osx-notifier
[AvnerCohen's code]: https://github.com/karma-runner/karma/commit/ffd48a7f9aa7bc9a27516393d4d592edc6b628f7
[homepage]: http://karma-runner.github.io
