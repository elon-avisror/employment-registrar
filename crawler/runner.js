const loader = require('csv-load-sync');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const child_process = require('child_process');

/**
 * args[0]: node (command)
 * args[1]: runner.js filename)
 * args[2]: user (string)
 * args[3]: pass (string)
 */
const args = process.argv;
const settings = { encoding: 'utf8', /*stdio: 'inherit'*/ };

// input and output files
const READ = 'src/applicants.csv';
const WRITE = 'output/log.csv';
const DEV = args.length == 4;
const DEBUG = false;

const csvReader = loader(READ);

// log.csv head content
const csvWriter = createCsvWriter({
    path: WRITE,
    header: [
        { id: 'id', title: 'idNumber' },
        { id: 'log', title: 'logInfo' },
        { id: 'record', title: 'record' },
        { id: 'errors', title: 'errors' }
    ]
});

// only if there are 4 parameters send to script file as follow
(async () => {

    if (DEV) {

        // in production
        const user = args[2];
        const pass = args[3];

        // in develop
        const data = [];

        csvReader.forEach(row => {

            // main code (for each row in applicants.csv file)
            try {

                // get data from this row
                const idNumber = row['idNumber'];
                const firstName = row['firstName'];
                const lastName = row['lastName'];
                const email = row['email'];
                const score = row['score'];
                const jobCode = row['jobCode'];
                const jobName = row['jobName'];
                const regionalCommiteCode = row['regionalCommiteCode'];
                const regionalCommiteName = row['regionalCommiteName'];

                if (DEBUG) {
                    console.log('\x1b[36m%s\x1b[0m', 'runner.js file:')
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

                // CS: execute registrar.js file (each one at the time)
                const cmd = `node crawler/registrar.js "${user}" "${pass}" "${idNumber}" "${firstName}" "${lastName}" "${email}" "${score}" "${jobCode}" "${jobName}" "${regionalCommiteCode}" "${regionalCommiteName}"`;
                const buf = child_process.execSync(cmd, settings, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                        // node couldn't execute the command
                        return;
                    }

                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                });

                const res = buf.split('#');
                res[0].replace('\n', ' --> ')

                if (Number(res[1]) == 0) {

                    // success
                    data.push({
                        id: idNumber,
                        log: `applicant "${idNumber}" registered in the system successfully`,
                        record: res[0], // record
                        errors: res[1] // errors
                    });
                }

                // (Number(buf[1]) != 0)
                else {

                    // failed
                    data.push({
                        id: idNumber,
                        log: `failed to register applicant "${idNumber}"`,
                        record: res[0], // record
                        errors: res[1] // errors
                    });
                }
            }
            catch (e) {

                console.log('runner.js: ' + e.message);

                // failed
                data.push({
                    id: idNumber,
                    log: `failed to execute the command "${cmd}"`,
                    record: e.message, // record
                    errors: '1' // errors
                });
            }
        });

        console.log('done reading from applicants.csv file');

        try {

            // write to logs.csv file the data that collected
            csvWriter
                .writeRecords(data)
                .then(() => console.log('done writing to log.csv file'));
        }
        catch (e) {
            console.log(e.message);
        }
    }

    else
        console.log('missing parameters "user" or "passowrd"');
})();