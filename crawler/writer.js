const puppeteer = require('puppeteer');
//var fs = require('fs');

// hard coded strings and settings
const isheadless = false;
const browserWidth = 1920 / 1.5;
const browserHeight = 1080 / 1.5;
//const userDataLocation = '/user_data_bn_';
const loginUserData = 'jenya0025';
const loginPasswordData = 'fvs3T73%T6';

// 1 - login
const loginUserSelector = 'input[name="Email"]';
const loginPasswordSelector = 'input[name="Password"]'
const loginSubmitSelector = 'button[type="submit"]';

// 2 - system navigation bar
const systemNavigationBarSelector = '.has-sub';
const systemTalentManagerSelector = 'li[class="has-sub expand"]';

const DEBUG = true;
const URL = 'http://40.127.202.26:9525';

// global variables
var browser = {};
var page = {};

//////////////////////////////////////////////////////////////////
async function isLocatorReady(element, page) {
  const isVisibleHandle = await page.evaluateHandle((e) => 
{
    const style = window.getComputedStyle(e);
    return (style && style.display !== 'none' && 
    style.visibility !== 'hidden' && style.opacity !== '0');
 }, element);
  var visible = await isVisibleHandle.jsonValue();
  const box = await element.boxModel();
  if (visible && box) {
    return true;
  }
  return false;
}

let clickAndWaitForTarget = async (clickSelector) => {
  const pageTarget = page.target(); // save this to know that this was the opener
  await page.click(clickSelector); // click on a link
  page = await browser.waitForTarget(target => target.opener() === pageTarget); // check that you opened this page, rather than just checking the url
  // await newPage.once("load",()=>{}); // this doesn't work; wait till page is loaded
  await page.waitForSelector("body"); // wait for page to be loaded
};
//////////////////////////////////////////////////////////////////

async function login() {
  try {

    // user
    await page.waitFor(loginUserSelector);
    await page.evaluate((loginUserSelector) => document.querySelector(loginUserSelector).click(), loginUserSelector);
    await page.click(loginUserSelector);
    await page.type(loginUserSelector, loginUserData);

    // password
    await page.waitFor(loginPasswordSelector);
    await page.evaluate((loginPasswordSelector) => document.querySelector(loginPasswordSelector).click(), loginPasswordSelector);
    await page.click(loginPasswordSelector);
    await page.type(loginPasswordSelector, loginPasswordData);

    // submit
    await page.waitFor(loginSubmitSelector);
    await page.evaluate((loginSubmitSelector) => document.querySelector(loginSubmitSelector).click(), loginSubmitSelector);
    await clickAndWaitForTarget(loginSubmitSelector);
    //page = await clickAndWaitForTarget(loginSubmitSelector, page, browser);

  }
  catch (e) {
    if (DEBUG) {
      if (e.message == 'Execution context was destroyed, most likely because of a navigation.')
        console.log('Loged in');
      else
        console.log('login: ' + e.message);
    }
  }
  return page;
}

async function systemNavigation() {
  try {
    await page.waitFor(systemNavigationBarSelector);
    //let messagesList = await page.evaluateHandle(selector => document.getElementsByClassName(selector), systemNavigationBarSelector);
    //console.log(messagesList);
    await page.waitFor('li[class="has-sub expand"]');
  }
  catch (e) {
    if (DEBUG)
      console.log('systemNavigation: ' + e.message);
  }
}

// main script code
(async () => {

    /*
    // make new directory
    let num = 1;
    while (fs.existsSync(__dirname + userDataLocation + num)) {
      num++;
    }
    */

    // setting chrome environment
    const browserOptions = {
      headless: isheadless, // so we can see the automation
      //userDataDir: path.join(__dirname + userDataLocation + num), // so we can save session data from one run to another. full path due to a bug in headlesschrome 
      args: ['--no-sandbox']
    };


  try
  {
    // 0 - start crawerling
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    page.setCacheEnabled(false);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');
    await page.setViewport({
      width: browserWidth,
      height: browserHeight,
      deviceScaleFactor: 2
    });

    if (DEBUG) {
      console.log('Starting browser crawlering');
      console.log('Browser Version: ' + await browser.version());
    }

    /*page = await browser.newPage();
    page.setCacheEnabled(false);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');
    await page.setViewport({
      width: browserWidth,
      height: browserHeight,
      deviceScaleFactor: 2
    }); */

    // 0 - start crawlering
    await page.goto(URL, {waitUntil: "networkidle2"});

    // 1 - login
    await login();

    // 2 - system navigation
    await systemNavigation();


    // * - end
    if (isheadless) {
      await browser.close();
      if (DEBUG)
        console.log('Closing browser crawlering');
    }
    else if (DEBUG)
      console.log('\x1b[36m%s\x1b[0m', 'Waiting for more!')
  }
  catch (e)
  {
    if (DEBUG)
      console.log(e);
  }
})();