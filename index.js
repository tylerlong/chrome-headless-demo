const spawn = require('child_process').spawn

const proc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  [
    '--user-data-dir=/Users/tyler.liu/src/js/chrome-headless-demo/chrome-user-data-dir',
    '--no-default-browser-check',
    '--no-first-run',
    '--disable-default-apps',
    '--disable-popup-blocking',
    '--disable-translate',
    '--disable-background-timer-throttling',
    '--disable-device-discovery-notifications'
  ]
)

setTimeout(function () {
  const result = proc.kill('SIGINT')
}, 5000)
