const spawn = require('child_process').spawn
const CDP = require('chrome-remote-interface')

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
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

setTimeout(() => {
  CDP(async (client) => {
    // Extract used DevTools domains.
    const { Page, Runtime } = client

    // Enable events on domains we are interested in.
    await Page.enable()
    await Page.navigate({ url: 'https://tylingsoft.com' })

    // Evaluate outerHTML after page has loaded.
    Page.loadEventFired(async () => {
      const result = await Runtime.evaluate({ expression: 'document.body.outerHTML' })
      console.log(result.result.value)
      client.close()
      chrome.kill('SIGINT')
    })
  }).on('error', (err) => {
    console.error('Cannot connect to browser:', err)
    chrome.kill('SIGINT')
  })
}, 3000)
