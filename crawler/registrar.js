const puppeteer = require('puppeteer');

/**
 * get parameters from runner.js file
 * args[0]: node (command)
 * args[1]: registrar.js (filename)
 * args[2]: user (string)
 * args[3]: pass (string)
 * args[4]: idNumber (string)
 * args[5]: firstName (string)
 * args[6]: lastName (string)
 * args[7]: email (string)
 * args[8]: score (string)
 * args[9]: jobCode (string)
 * args[10]: jobName (string)
 * args[11]: regionalCommiteCode (string)
 * args[12]: regionalCommiteName (string)
 */

var args = process.argv;

const user = args[2];
const pass = args[3];
const idNumber = args[4];
const firstName = args[5];
const lastName = args[6];
const email = args[7];
const score = args[8];
const jobCode = args[9];
const jobName = args[10];
const regionalCommiteCode = args[11];
const regionalCommiteName = args[12];

// developer options
const DEBUG = false;
const SIGNAL = true;
const URL = 'pwm:9525';
const DEV = false;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Hard Coded Settings ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// 0 - set settings
const isheadless = false;
const browserWidth = 1920 / 1.5;
const browserHeight = 1080 / 1.5;

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
const workflowProcessButtonXPath = '//*[@id="myTabs"]/li[9]/a';
const workflowProcessLinkSelectSelector = 'select[class="col-md-8 form-control"]';
const workflowProcessLinkValueSelector = '18';
const workflowProcessSubmitSelector = 'button[class="btn btn-success "]';
const workflowProcessWaitSelector = 'div[class="col-md-6"]';
const workflowProcessMakeXPath = '//*[@id="0"]/div/div/div[6]/div[3]/button[1]';
const workflowProcessFormXPath = '//*[@id="rfhTasksEmployment-details"]';
const workflowProcessContractDepartmentSelectSelector = 'select[id="employment-Department"]';
const workflowProcessContractDepartmentSelectXPath = '//*[@id="employment-Department"]';
const workflowProcessContractPositionSelectXPath = '//*[@id="employment-Position"]';
const workflowProcessContractPositionSelectSelector = 'select#employment-Position option';
const workflowProcessContractDateOfHireSelector = 'input[id="employment-EmploymentStart"]';
const workflowProcessContractDateOfElectionsSelector = 'input[id="employment-EmploymentEnd"]';
const workflowProcessContractSaveXPath = '//*[@id="addemployments-modal"]/div/div/div[3]/button[1]';
const workflowProcessContractCompleteSelector = 'button[class="btn btn-success btn-sm"]';
const workflowProcessFinalizeButtonXPath = '//*[@id="1"]/div/div/div[22]/button[1]';
const workflowProcessPopupXPath = '//*[@id="finalizeEmployee-modal"]/div/div/div[3]/button[1]';

// getting assignment data from the csv file
const assignmentApplicantID = idNumber;
const workflowProcessContractDepartmentValue = regionalCommiteName;
const workflowProcessContractDateOfHireValue = '15-08-2019'; // TODO: search for it
const workflowProcessContractDateOfElectionsValue = '17-09-2019'; // permanent
const workflowProcessContractPositionCodeValue = jobCode; // TODO: check if it is auto

// global variables
var browser = {};
var page = {};
var err = 0;

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
    await clickAndType(userSelector, user);

    // password
    await clickAndType(passSelector, pass);

    // submit
    await justClick(submitSelector);

    // wait for targeting the system
    await clickAndWaitForTarget(submitSelector);

  }
  catch (e) {
    if (SIGNAL) {
      if (e.message == 'Execution context was destroyed, most likely because of a navigation.')
        console.log('1 - Loged in');
      else {
        console.log('login: ' + e.message);
        err++;
      }
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


    if (SIGNAL)
      console.log('2 - Navigate');
  }
  catch (e) {
    if (SIGNAL) {
      console.log('systemNavigation: ' + e.message);
      err++;
    }
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

    if (SIGNAL)
      console.log('3 - Application Found');
  }
  catch (e) {
    if (SIGNAL) {
      console.log('applicationFound: ' + e.message);
      err++;
    }
  }
}

async function assignmentRoutine() {

  try {

    // id
    await clickAndType(assignmentFieldSelector, assignmentApplicantID);

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

    if (SIGNAL)
      console.log('4.a - Found ID');

  }
  catch (e) {
    if (SIGNAL) {
      console.log('assignmentRoutine: ' + e.message);
      err++;
    }
  }
}

async function workflowProcessRoutine() {
  try {

    async function createLink() {

      try {

        // select
        await page.waitFor(4000); // time for select
        await justSelect(workflowProcessLinkSelectSelector, workflowProcessLinkValueSelector);

        // submit
        await justClick(workflowProcessSubmitSelector);
        await page.waitFor(workflowProcessWaitSelector);
      }
      catch (e) {
        if (SIGNAL) {
          console.log('createLink: ' + e.message);
          err++;
        }
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
          if (SIGNAL) {
            console.log('selectData: ' + e.message);
            err++;
          }
        }
      }

      try {

        // contract
        await page.waitFor(15000); // wait for delay time
        await clickByXPath(workflowProcessMakeXPath, {timeout: 60000});
        await page.waitFor(workflowProcessFormXPath);

        // election
        await selectData(workflowProcessContractDepartmentSelectXPath, workflowProcessContractDepartmentSelectSelector, workflowProcessContractDepartmentValue);
        await page.waitFor(3000); // wait for selector

        // position (job name)
        await clickByXPath(workflowProcessContractPositionSelectXPath);
        const dropdowns = await page.$$eval(workflowProcessContractPositionSelectSelector, all => all.map(a => a.textContent));

        for (let i = 0; i < dropdowns.length; i++) {

          if (dropdowns[i] == jobName) {
            // success
            await page.keyboard.press('Enter');
            break;
          }

          else
            // check if the text is equal jobName
            await page.keyboard.press('ArrowDown');
        }

        // TODO: auto (job code)

        // date of hire
        await justClick(workflowProcessContractDateOfHireSelector);
        await page.click(workflowProcessContractDateOfHireSelector);

        for (let i = 0; i < 12; i++)
          await page.keyboard.press('Backspace');

        await page.type(workflowProcessContractDateOfHireSelector, workflowProcessContractDateOfHireValue);
        await page.keyboard.press('Enter');

        // date of elections
        await justClick(workflowProcessContractDateOfElectionsSelector);
        await page.click(workflowProcessContractDateOfElectionsSelector);

        for (let i = 0; i < 12; i++)
          await page.keyboard.press('Backspace');

        await page.type(workflowProcessContractDateOfElectionsSelector, workflowProcessContractDateOfElectionsValue);
        await page.keyboard.press('Enter');

        // save
        await page.waitFor(2000); // wait for delay of dating
        await clickByXPath(workflowProcessContractSaveXPath);

        // complete
        await page.waitFor(15000); // wait for delay of saving
        await justClick(workflowProcessContractCompleteSelector)
      }
      catch (e) {
        if (SIGNAL) {
          console.log('fullfillContract: ' + e.message);
          err++;
        }
      }
    }

    async function finalizeElectionWorker() {

      try {

        // enter
        await clickByXPath(workflowProcessFinalizeButtonXPath);
        await page.waitFor(5000);

        // save
        await clickByXPath(workflowProcessPopupXPath);

        // clear
        /*
        await page.waitFor(45000);
        await page.click(workflowProcessEndRoutineSelector);
        */
      }
      catch (e) {
        if (SIGNAL) {
          console.log('finalizeElectionWorker: ' + e.message);
          err++;
        }
      }
    }


    // in workflow tab, press on 'Hiring Workflow' tab
    await page.waitFor(2000); // time for delay
    await page.waitFor(workflowProcessTabSelector);
    await page.waitFor(workflowProcessCheckSelector);
    await clickByXPath(workflowProcessButtonXPath);

    // a
    await createLink();

    await page.waitFor(4000); // wait for server delay

    // b
    await fullfillContract();

    await page.waitFor(4000); // wait for server delay

    // c
    await finalizeElectionWorker();

    await page.waitFor(20000); // wait for server delay

    if (SIGNAL)
      console.log('4.b - WorkFlow Process Ended');
  }
  catch (e) {
    if (SIGNAL) {
      console.log('workflowProcessRoutine: ' + e.message);
      err++;
    }
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ START Crawling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// main script code
(async () => {

  // setting chrome environment
  const browserOptions = {
    headless: isheadless, // so we can see the automation
    args: ['--no-sandbox', '--start-fullscreen']
  };

  if (DEBUG) {
    console.log('\x1b[36m%s\x1b[0m', 'ragistrar.js file:')
    console.log('user: ' + user);
    console.log('pass: ' + pass);
    console.log('idNumber: ' + idNumber);
    console.log('firstName: ' + firstName);
    console.log('lastName: ' + lastName);
    console.log('email: ' + email);
    console.log('score: ' + score);
    console.log('jobCode: ' + jobCode);
    console.log('jobName: ' + jobName);
    console.log('regionalCommiteCode: ' + regionalCommiteCode);
    console.log('regionalCommiteName: ' + regionalCommiteName + '\n');
  }

  if (args.length == 13) {

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
      if (SIGNAL) {
        console.log(e);
        err++;
      }
    }
  
    // * - end
    if (!DEV) {
      await browser.close();
      if (DEBUG)
        console.log('\x1b[36m%s\x1b[0m', 'Closing browser crawlering');
    }
  
    console.log('#' + err + '#');

  }

  // args.length != 13
  else
    console.log('there is problem with the number of parameters that provided');
})();
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END Crawling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */