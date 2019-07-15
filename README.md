# PWM Crawler

**_made with puppeteer package._**

## Introduction

_This puppeteer software built for kneset-gil._

1. **crawler/registrar.js** is a puppeteer script that register an applicant.

2. **crawler/runner.js** is a batch file, that:

   - first, it reads from **src/applicants.csv** file.
   - for each row (in **src/applicants.csv**), it runs **crawler/registrar.js** (to register a specific applicant).
   - finally, it logs the output data into **output/log.csv file** (whose collected).

## Installation

1. [Download Node.js](https://nodejs.org/en/download/) and install it.

2. Go to the project directory and then perform the following commands:

        npm install

## Execution

_In order to execute the batch file (**crawler/runner.js**), open terminal and follow this bash commands:_

    node runner.js "USER" "PASS"

- "USER" - it's the user of Scytl system.
- "PASS" - it's the password for the user you mention of Scytl system.

## CSV Files

1. Make sure that **src/applicants.csv** file written with this columns (with all the data in it):

        | idNumber | jobName | regionalCommiteName | dateOfHire |

    - idNumber - is the identification number of the applicant.
    - jobName - is the job name of the sepcified applicant.
    - regionalCommiteName - is the name of the regional commite of the specified applicant.
    - dateOfHire - is the date that the specified applicant hired.

      Example:

          | 305370801 | Developer | Yeruham | 01/10/2018 |

      _You can see 3 more examples in **src/applicants.csv** file_.

2. After you execute the script, you can see the results in **output/log.csv** file.

3. Pay attention, **output/log.csv** file is only for example, your output files will be: **output/log1.csv**, **output/log2.csv**, etc.

### Made by _Elon Avisror_ \ ( ゜ o ゜)ノ

![GitHub Logo](src/logo.gif)
