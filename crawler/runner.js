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
const READ = 'src/example.csv';
const WRITE = 'src/log.csv';
const DEV = args.length == 4;
const DEBUG = false;

const csvReader = loader(READ);

// log.csv head content
const csvWriter = createCsvWriter({
    path: WRITE,
    header: [
        { id: 'id', title: 'IDNumber' },
        { id: 'log', title: 'LogInfo' },
        //{ id: 'record', title: 'Record' },
        { id: 'errors', title: 'Errors' }
    ]
});

// only if there are 4 parameters send to script file as follow
// TODO: args.length == 4

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
                const IDNumber = row['IDNumber'];
                const firstName = row['FirstName'];
                const lastName = row['LastName'];
                const email = row['email'];
                const totalScore = row['TotalScore'];
                const jobCode = row['JobCode'];
                const jobName = row['JobName'];
                const regionalCommiteCode = row['קוד ועדה אזורית'];
                const regionalCommiteName = row['שם ועדה אזורית'];

                if (DEBUG) {
                    console.log('\x1b[36m%s\x1b[0m', 'runner.js file:')
                    console.log('user: ' + user);
                    console.log('pass: ' + pass);
                    console.log('IDNumber: ' + IDNumber);
                    console.log('firstName: ' + firstName);
                    console.log('lastName: ' + lastName);
                    console.log('email: ' + email);
                    console.log('totalScore: ' + totalScore);
                    console.log('jobCode: ' + jobCode);
                    console.log('jobName: ' + jobName);
                    console.log('regionalCommiteCode: ' + regionalCommiteCode);
                    console.log('regionalCommiteName: ' + regionalCommiteName + '\n');
                }

                // CS: execute registrar.js file (each one at the time)
                const cmd = `node crawler/registrar.js "${user}" "${pass}" "${IDNumber}" "${firstName}" "${lastName}" "${email}" "${totalScore}" "${jobCode}" "${jobName}" "${regionalCommiteCode}" "${regionalCommiteName}"`;
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
                        id: row['IDNumber'],
                        log: `applicant "${row['IDNumber']}" registered in the system successfully`,
                        //record: res[0], // record
                        errors: res[1] // errors
                    });
                }

                // (Number(buf[1]) > 0)
                else {

                    // failed
                    data.push({
                        id: row['IDNumber'],
                        log: `failed to register applicant "${row['IDNumber']}"`,
                        //record: res[0], // record
                        errors: res[1] // errors
                    });
                }
            }
            catch (e) {

                console.log('runner.js: ' + e.message);

                // failed
                data.push({
                    id: row['IDNumber'],
                    log: `failed to execute the command "${cmd}"`,
                    //record: e.message, // record
                    errors: '1' // errors
                });
            }
        });

        console.log('done reading from applicants.csv file');

        // write to logs.csv file the data that collected
        csvWriter
            .writeRecords(data)
            .then(() => console.log('done writing to log.csv file'));
    }

    else
        console.log('missing parameters "user" or "passowrd"');
})();