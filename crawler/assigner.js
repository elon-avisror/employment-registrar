const puppeteer = require('puppeteer');
//const fs = require('fs');

// developer options
const DEBUG = true;
const URL = 'pwm:9525';
const DEV = false;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Hard Coded Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// 0 - set settings
const isheadless = false;
const browserWidth = 1920 / 1.5;
const browserHeight = 1080 / 1.5;
//const userDataLocation = '/user_data_bn_';

// TODO: get from the command line
const userData = 'jenya0025';
const passData = 'fvs3T73%T6';

// 1 - login
const userSelector = 'input[name="Email"]';
const passSelector = 'input[name="Password"]'
const submitSelector = 'button[type="submit"]';

// 2 - system navigation bar
const systemNavBarSelector = '.has-sub';
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

//const workflowProcessContractPositionSelectSelector = 'select[id="employment-Position"]';

const workflowProcessContractDateOfHireSelector = 'input[id="employment-EmploymentStart"]';
const workflowProcessContractDateOfElectionsSelector = 'input[id="employment-EmploymentEnd"]';
const workflowProcessContractCompleteSelector = 'button[class="btn btn-success btn-sm"]';

//const workflowProcessFinalizeButtonSelector = 'button[class="btn btn-primary btn-sm"]';
//const workflowProcessContractConfirmSelector = '//*[@id="addemployments-modal"]/div/div/div[3]/button[1]';

const workflowProcessFinalizeButtonSelector = '//*[@id="1"]/div/div/div[22]/button[1]';

//const workflowProcessPopupSelector = 'div[class="modal-content"]';

const workflowProcessPopupSelector = '//*[@id="finalizeEmployee-modal"]/div/div/div[3]/button[1]';
const workflowProcessEndRoutineSelector = 'button[class="btn btn-primary"]';

// EXCEL FILE DATA
const assignmentApplicantIDSelector = '200656627';
const workflowProcessContractDepartmentValueSelector = '01-ירושלים';

//const workflowProcessContractPositionValueSelector = 'טסט';

const workflowProcessContractDateOfHireValueSelector = '15-08-2019';
const workflowProcessContractDateOfElectionsValueSelector = '17-09-2019';

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
  await page.waitFor(xpath);
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

async function clickAndType(selector, text) {
  await page.waitFor(selector);
  await page.evaluate((selector) => document.querySelector(selector).click(), selector);
  await page.click(selector);
  await page.type(selector, text);
}

async function justClick(selector) {
  await page.waitFor(selector);
  await page.evaluate((selector) => document.querySelector(selector).click(), selector);
}

async function justSelect(selector, select) {
  await page.waitFor(selector);
  await page.select(selector, select);
}

async function login() {
  try {

    // user
    await clickAndType(userSelector, userData);

    // password
    await clickAndType(passSelector, passData);

    // submit
    await justClick(submitSelector);

    // wait for targeting the system
    await clickAndWaitForTarget(submitSelector);

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

    // navigate to talent manager
    await page.waitFor(systemNavBarSelector);
    await page.waitFor(1000); // time for extra
    await justClick(systemApplicationsSelector);
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
    await justClick(applicantTypeSelector);
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
    await clickAndType(assignmentFieldSelector, assignmentApplicantIDSelector);

    // init search
    await page.waitFor(assignmentSearchButtonSelector);
    await page.evaluate((assignmentSearchButtonSelector) => document.querySelector(assignmentSearchButtonSelector).click(), assignmentSearchButtonSelector);

    // searching the id
    await page.waitFor(5000); // time for init search
    await page.waitFor(assignmentTableSelector);
    await page.click(assignmentSearchButtonSelector);

    // go to workflow process
    await justClick(assignmentApplicantUserSelector);
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

      try {

        // select
        await page.waitFor(2000); // time for select
        await justSelect(workflowProcessLinkSelectSelector, workflowProcessLinkValueSelector);

        // submit
        await justClick(workflowProcessSubmitSelector);
        await page.waitFor(workflowProcessWaitSelector);
      }
      catch (e) {
        if (DEBUG)
          console.log('createLink: ' + e.message);
      }
    }

    async function fullfillContract() {

      async function selectData(id, selector, data) {

        try {
          await page.waitFor(selector);
          const option = (await page.$x(
            `${id}/option[text() = "${data}"]`
          ))[0];
          const value = await (await option.getProperty('value')).jsonValue();
          await page.select(selector, value);
        }
        catch (e) {
          if (DEBUG)
            console.log('selectData: ' + e.message);
        }
      }


      try {

        // contract
        await page.waitFor(4000); // wait for delay time
        await clickByXPath(workflowProcessMakeSelector);
        await page.waitFor(workflowProcessFormSelector);

        // election
        await selectData('//*[@id="employment-Department"]', workflowProcessContractDepartmentSelectSelector, workflowProcessContractDepartmentValueSelector);
        await page.waitFor(3000); // wait for selector

        // position
        // TODO: not working
        await clickByXPath('//*[@id="employment-Position"]');

        for (let i = 0; i < 4; i++)
          await page.keyboard.press('ArrowDown');

        await page.keyboard.press('Enter');
        //await selectData('//*[@id="employment-Position"]', workflowProcessContractPositionSelectSelector, workflowProcessContractPositionValueSelector);

        // date of hire
        // TODO: delete old text and then type
        await justClick(workflowProcessContractDateOfHireSelector);
        await page.click(workflowProcessContractDateOfHireSelector);

        for (let i = 0; i < 12; i++)
          await page.keyboard.press('Backspace');

        await page.type(workflowProcessContractDateOfHireSelector, workflowProcessContractDateOfHireValueSelector);
        //await page.keyboard.type(workflowProcessContractDateOfHireValueSelector);
        await page.keyboard.press('Enter');

        /*
        // pressing '14-06-2019'
        await page.keyboard.press('1');
        await page.keyboard.press('4');
        await page.keyboard.press('-');
        await page.keyboard.press('0');
        await page.keyboard.press('6');
        await page.keyboard.press('-');
        await page.keyboard.press('2');
        await page.keyboard.press('0');
        await page.keyboard.press('1');
        await page.keyboard.press('9');
        */

        // date of elections
        // TODO: delete old text and then type
        await justClick(workflowProcessContractDateOfElectionsSelector);
        await page.click(workflowProcessContractDateOfElectionsSelector);

        for (let i = 0; i < 12; i++)
          await page.keyboard.press('Backspace');

        await page.type(workflowProcessContractDateOfElectionsSelector, workflowProcessContractDateOfElectionsValueSelector);
        await page.keyboard.press('Enter');
        //await page.keyboard.type(workflowProcessContractDateOfElectionsValueSelector);

        /*
        // pressing '17-09-2019'
        await page.keyboard.press('Key1');
        await page.keyboard.press('Key7');
        await page.keyboard.press('Key-');
        await page.keyboard.press('Key0');
        await page.keyboard.press('Key9');
        await page.keyboard.press('Key-');
        await page.keyboard.press('Key2');
        await page.keyboard.press('Key0');
        await page.keyboard.press('Key1');
        await page.keyboard.press('Key9');
        */

        // save
        await page.waitFor(2000); // wait for delay of dating
        await clickByXPath('//*[@id="addemployments-modal"]/div/div/div[3]/button[1]');

        // complete
        await page.waitFor(15000); // wait for delay of saving
        await justClick(workflowProcessContractCompleteSelector);
        //await clickByXPath('//*[@id="0"]/div/div/div[6]/div[3]/button[2]');
        /*
        await page.waitFor(workflowProcessContractConfirmSelector);
        await page.evaluate((workflowProcessContractConfirmSelector) => document.querySelector(workflowProcessContractConfirmSelector).click(), workflowProcessContractConfirmSelector);
        await page.click(workflowProcessContractConfirmSelector);
        */
      }
      catch (e) {
        if (DEBUG)
          console.log('fullfillContract: ' + e.message);
      }
    }

    async function finalizeElectionWorker() {

      try {

        // enter
        await clickByXPath(workflowProcessFinalizeButtonSelector);
        await page.waitFor(5000);
        /*
        await page.waitFor(workflowProcessFinalizeButtonSelector);
        await page.evaluate((workflowProcessFinalizeButtonSelector) => document.querySelector(workflowProcessFinalizeButtonSelector).click(), workflowProcessFinalizeButtonSelector);
        await page.waitFor(workflowProcessPopupSelector);
        */

        // save
        await clickByXPath(workflowProcessPopupSelector);

        // clear
        /*
        await page.waitFor(45000);
        await page.click(workflowProcessEndRoutineSelector);
        */
      }
      catch (e) {
        if (DEBUG)
          console.log('finalizeElectionWorker: ' + e.message);
      }
    }


    // in workflow tab, press on 'Hiring Workflow' tab
    await page.waitFor(2000); // time for delay
    await page.waitFor(workflowProcessTabSelector);
    await page.waitFor(workflowProcessCheckSelector);
    await clickByXPath(workflowProcessButtonSelector);

    // a
    await createLink();

    await page.waitFor(4000); // wait for server delay

    // b
    await fullfillContract();

    await page.waitFor(4000); // wait for server delay

    // c
    await finalizeElectionWorker();

    await page.waitFor(20000); // wait for server delay

    if (DEBUG)
      console.log('4.b - WorkFlow Process Ended');
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
    args: ['--no-sandbox', '--start-fullscreen']
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
      console.log('\x1b[36m%s\x1b[0m', 'Starting browser crawlering');
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
    if (DEV)
      console.log('\x1b[36m%s\x1b[0m', 'Waiting for more!')
  }
  catch (e) {
    if (DEBUG)
      console.log(e);
  }

  // * - end
  if (!DEV) {
    await browser.close();
    if (DEBUG)
      console.log('\x1b[36m%s\x1b[0m', 'Closing browser crawlering');
  }
})();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END Crawling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */