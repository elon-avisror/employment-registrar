const puppeteer = require('puppeteer');
//var fs = require('fs');

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Hard Coded Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// 0 - set settings
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

// 4.a - assignment
const assignmentFieldSelector = 'input[class="input-xlarge form-control"]';
const assignmentSearchButtonSelector = 'button[class="btn btn-success"]';
const assignmentTableSelector = 'tbody[data-bind="foreach: Items"]';
const assignmentApplicantUserSelector = 'a[targer="_blank"]';

// 4.b - workflow process
const workflowProcessTabSelector = 'a[class="nav-link"]';
const workflowProcessCheckSelector = 'li[data-bind="visible:CanViewRFH"]';
const workflowProcessButtonSelector = '//*[@id="myTabs"]/li[9]/a';
const workflowProcessLinkSelectSelector = 'select[class="col-md-8 form-control"]';
const workflowProcessLinkValueSelector = '18';
const workflowProcessSubmitSelector = 'button[class="btn btn-success "]';
const workflowProcessWaitSelector = 'div[class="col-md-6"]';
const workflowProcessMakeSelector = '//*[@id="0"]/div/div/div[6]/div[3]/button[1]';
const workflowProcessFormSelector = '//*[@id="rfhTasksEmployment-details"]';
const workflowProcessContractDepartmentSelectSelector = 'select[id="employment-Department"]';
const workflowProcessContractPositionSelectSelector = 'select[id="employment-Position"]';
const workflowProcessContractDateSelector = 'input[id="employment-EmploymentStart"]';

// EXCEL FILE DATA
const assignmentApplicantIDSelector = '200656627';
const workflowProcessContractDepartmentValueSelector = '01-ירושלים';
const workflowProcessContractPositionValueSelector = 'טסט';


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

const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`);
  return `concat('${splitedQuotes}', '')`;
};

const clickByText = async (text) => {
  const escapedText = escapeXpathString(text);
  const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`);

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    throw new Error(`Link not found: ${text}`);
  }
};

const clickByXPath = async (xpath) => {
  const linkHandlers = await page.$x(xpath);

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    throw new Error(`Link not found: ${text}`);
  }
};

let clickAndWaitForTarget = async (clickSelector) => {
  const pageTarget = page.target(); // save this to know that this was the opener
  await page.click(clickSelector); // click on a link
  page = await browser.waitForTarget(target => target.opener() === pageTarget); // check that you opened this page, rather than just checking the url
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
        console.log('1 - Loged in');
      else
        console.log('login: ' + e.message);
    }
  }
  return page;
}

async function systemNavigation() {
  try {

    await page.waitFor(systemNavigationBarSelector);
    await page.waitFor(1000); // time for extra
    await page.evaluate((systemApplicationsSelector) => document.querySelector(systemApplicationsSelector).click(), systemApplicationsSelector);
    await page.waitFor(2000); // time for navigation

    if (DEBUG)
      console.log('2 - Navigate');
  }
  catch (e) {
    if (DEBUG)
      console.log('systemNavigation: ' + e.message);
  }
}

async function applicationFound() {
  try {

    // goto applications
    await page.waitFor(3000); // time for button
    await page.waitFor(applicantTypeSelector);
    await page.evaluate((applicantTypeSelector) => document.querySelector(applicantTypeSelector).click(), applicantTypeSelector);

    await page.waitFor(applicantIDSelector);
    await clickByText(`Applicant Israel ID`);
    await page.waitFor(3000); // time for data

    if (DEBUG)
      console.log('3 - Application Found');
  }
  catch (e) {
    if (DEBUG)
      console.log('applicationFound: ' + e.message);
  }
}

async function assignmentRoutine() {

  try {

    // id
    await page.waitFor(assignmentFieldSelector);
    await page.evaluate((assignmentFieldSelector) => document.querySelector(assignmentFieldSelector).click(), assignmentFieldSelector);
    await page.click(assignmentFieldSelector);
    await page.type(assignmentFieldSelector, assignmentApplicantIDSelector);

    // init search
    await page.waitFor(assignmentSearchButtonSelector);
    await page.evaluate((assignmentSearchButtonSelector) => document.querySelector(assignmentSearchButtonSelector).click(), assignmentSearchButtonSelector);

    // searching the id
    await page.waitFor(5000); // time for init search
    await page.waitFor(assignmentTableSelector);
    await page.click(assignmentSearchButtonSelector);

    // go to workflow process
    await page.waitFor(assignmentApplicantUserSelector);
    await page.evaluate((assignmentApplicantUserSelector) => document.querySelector(assignmentApplicantUserSelector).click(), assignmentApplicantUserSelector);
    await page.waitFor(5000); // time for redirecting

    // reload new tab page
    const pages = await browser.pages();
    const size = pages.length;
    page = pages[size - 1];

    if (DEBUG)
      console.log('4.a - Found ID');

  }
  catch (e) {
    if (DEBUG)
      console.log('assignmentRoutine: ' + e.message);
  }
}



async function workflowProcessRoutine() {
  try {

    async function createLink() {

      // select
      await page.waitFor(2000); // time for select
      await page.waitFor(workflowProcessLinkSelectSelector);
      await page.select(workflowProcessLinkSelectSelector, workflowProcessLinkValueSelector);

      // submit
      await page.waitFor(workflowProcessSubmitSelector);
      await page.evaluate((workflowProcessSubmitSelector) => document.querySelector(workflowProcessSubmitSelector).click(), workflowProcessSubmitSelector);
      await page.waitFor(workflowProcessWaitSelector);
    }

    async function fullfillContract() {

      async function selectData(id ,selector, data) {

        await page.waitFor(selector);
        const option = (await page.$x(
          `${id}/option[text() = "${data}"]`
        ))[0];
        const value = await (await option.getProperty('value')).jsonValue();
        await page.select(selector, value);
      }

      // contract
      await page.waitFor(workflowProcessMakeSelector);
      await clickByXPath(workflowProcessMakeSelector);
      await page.waitFor(workflowProcessFormSelector);

      // election
      await selectData('//*[@id="employment-Department"]' ,workflowProcessContractDepartmentSelectSelector, workflowProcessContractDepartmentValueSelector);

      // position
      await selectData('//*[@id="employment-Position"]' ,workflowProcessContractPositionSelectSelector, workflowProcessContractPositionValueSelector);
    }

    // in workflow tab, press on 'Hiring Workflow' tab
    await page.waitFor(2000); // time for delay
    await page.waitFor(workflowProcessTabSelector);
    await page.waitFor(workflowProcessCheckSelector);
    await page.waitFor(workflowProcessButtonSelector);
    await clickByXPath(workflowProcessButtonSelector);

    // a
    await createLink();

    // b
    await fullfillContract();


    if (DEBUG)
      console.log('4.b - Go to WorkFlow Process');
  }
  catch (e) {
    if (DEBUG)
      console.log('workflowProcessRoutine: ' + e.message);
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


  try {
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

    await page.goto(URL, { waitUntil: "networkidle2" });

    /* ONCE */

    // 1 - login
    await login();

    // 2 - system navigation
    await systemNavigation();

    // 3 - appliacations
    await applicationFound();

    /* ONCE */

    /* ROUTINE */

    // 4.a - assignment
    await assignmentRoutine();

    // 4.b - workflow process
    await workflowProcessRoutine();

    /* ROUTINE */

    // TODO: continue...
    if (DEBUG)
      console.log('\x1b[36m%s\x1b[0m', 'Waiting for more!')
  }
  catch (e) {
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