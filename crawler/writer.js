const puppeteer = require('puppeteer');
//var fs = require('fs');

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Hard Coded Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
const systemApplicationsSelector = 'a[href="/WFM/TM/Application/List"]';

// 3 - applications
const applicantTypeSelector = 'span[data-bind="text: GetSelectedSearch()"]';
const applicantIDSelector = 'a[href="#"]';

// 4 - assignment routine
const applicantFieldSelector = 'input[class="input-xlarge form-control"]';

const DEBUG = true;
const URL = 'http://40.127.202.26:9525';
const END = false;

// global variables
var browser = {};
var page = {};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END Hard Coded Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/*
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
*/

let clickAndWaitForTarget = async (clickSelector) => {
  const pageTarget = page.target(); // save this to know that this was the opener
  await page.click(clickSelector); // click on a link
  page = await browser.waitForTarget(target => target.opener() === pageTarget); // check that you opened this page, rather than just checking the url
  // await newPage.once("load",()=>{}); // this doesn't work; wait till page is loaded
  await page.waitForSelector("body"); // wait for page to be loaded
};

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
    await page.evaluate((systemApplicationsSelector) => document.querySelector(systemApplicationsSelector).click(), systemApplicationsSelector);
    await page.waitFor(2000); // time for navigation
  }
  catch (e) {
    if (DEBUG)
      console.log('systemNavigation: ' + e.message);
  }
}

async function applicationFound() {
  try {

    await page.waitFor(applicantTypeSelector);
    await page.evaluate((applicantTypeSelector) => document.querySelector(applicantTypeSelector).click(), applicantTypeSelector);
    
    await page.waitFor(applicantIDSelector);
    const linkHandlers = await page.$x("//a[contains(text(), 'Applicant Israel ID')]");

    if (linkHandlers.length > 0) {
      await linkHandlers[0].click();
    } else {
      throw new Error("Link not found");
    }

  }
  catch (e) {
    if (DEBUG)
      console.log('applicationFound: ' + e.message);
  }
}

async function assignmentRoutine() {

  try {

  }
  catch (e) {
    if (DEBUG)
      console.log('assignmentRoutine: ' + e.message);
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Crawling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
    // 0 - set settings
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

    await page.goto(URL, {waitUntil: "networkidle2"});
    
    // 1 - login
    await login();

    // 2 - system navigation
    await systemNavigation();

    // 3 - appliacations
    await applicationFound();

    // 4 - assignment routine
    await assignmentRoutine();

    // TODO: continue...
    if (DEBUG)
      console.log('\x1b[36m%s\x1b[0m', 'Waiting for more!')
  }
  catch (e)
  {
    if (DEBUG)
      console.log(e);
  }

  // * - end
  if (END) {
    await browser.close();
    if (DEBUG)
      console.log('Closing browser crawlering');
  }
})();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END Crawling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */