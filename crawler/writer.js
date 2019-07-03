const puppeteer = require('puppeteer');
 
// hard coded strings and settings
const isheadless = false;
const userDataLocation = "/user_data_bn_";
const DEBUG = true;

// global variables
//var browser = {};
//var page = {};

// main script
(async () => {

    // setting chrome environment
    /*const browserOptions = {
      headless: isheadless, //so we can scan the QR code
      userDataDir: path.join(__dirname + userDataLocation + num), //so we can save session data from one run to another. full path due to a bug in headlesschrome 
      args: ['--no-sandbox']
    }; */


  try
  {
    //browser = await puppeteer.launch(browserOptions);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log("Starting browser");
    console.log(await browser.version());

    /*page = await browser.newPage();
    page.setCacheEnabled(false);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');
    await page.setViewport({
      width: browserWidth,
      height: browserHeight,
      deviceScaleFactor: 2
    }); */

    // start crawlering
    await page.goto('https://example.com');
    await page.screenshot({path: 'example.png'});

    // end
    await browser.close();

    console.log("Closing browser");
    if (isheadless)
      await browser.close();
  }
  catch (e)
  {
    if (DEBUG) console.log(e);
  }
})();