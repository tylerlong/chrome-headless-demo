const spawn = require('child_process').spawn
const CDP = require('chrome-remote-interface')
const fs = require('fs')

const viewportWidth = 1440
const viewportHeight = 900
const aspectRatio = viewportWidth / viewportHeight
const imgWidth = viewportWidth
const imgHeight = Math.floor(imgWidth / aspectRatio)

const deviceMetrics = {
  width: viewportWidth,
  height: viewportHeight,
  deviceScaleFactor: 0,
  mobile: false,
  fitWindow: false
}

const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let chrome = null

const startChrome = () => {
  chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
}

const quitChrome = () => {
  if (chrome != null) {
    chrome.kill('SIGINT')
  }
}

const main = async () => {
  startChrome()
  await timeout(3000)
  CDP(async (client) => {
    // Extract used DevTools domains.
    const { CSS, DOM, Network, Emulation, Page, Runtime } = client

    // Enable events on domains we are interested in.
    await Page.enable()
    await DOM.enable()
    await CSS.enable()
    await Network.enable()
    await Emulation.setDeviceMetricsOverride(deviceMetrics)
    await Emulation.setVisibleSize({width: imgWidth, height: imgHeight})

    await Page.navigate({ url: 'https://tylingsoft.com' })

    // Evaluate outerHTML after page has loaded.
    Page.loadEventFired(async () => {
      const result = await Runtime.evaluate({ expression: 'document.body.outerHTML' })
      console.log(result.result.value)

      await timeout(3000)
      const screenshot = await Page.captureScreenshot({ format: 'png' })
      const buffer = Buffer.from(screenshot.data, 'base64')
      fs.writeFile('temp.png', buffer, 'base64', function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log('Screenshot saved')
        }
        client.close()
        quitChrome()
      })
    })
  }).on('error', (err) => {
    console.error('Cannot connect to browser:', err)
    quitChrome()
  })
}

main()
