const fs = require('fs');
const loader = require('csv-load-sync');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const child_process = require('child_process');

/**
 * get parameters from the terminal (as strings)
 * args[0]: node (command)
 * args[1]: runner.js filename)
 * args[2]: user
 * args[3]: pass
 */
const args = process.argv;
const settings = { encoding: 'utf8', /*stdio: 'inherit'*/ };

// input and output files

let cnt = fs.readFileSync("src/counter.txt", settings);
cnt = Number(cnt); // casting
const data = (++cnt).toString(); // increment

fs.writeFileSync('src/counter.txt', data, (err) => {

    // in case of a error throw err
    if (err)
        throw err;
});

const READ = 'src/applicants.csv';
const WRITE = `output/log${cnt}.csv`;
const PARAMS = args.length == 4;
const DEBUG = false;

const csvReader = loader(READ);

// log*.csv head content
const csvWriter = createCsvWriter({
    path: WRITE,
    header: [
        { id: 'id', title: 'idNumber' },
        { id: 'log', title: 'logInfo' },
        { id: 'record', title: 'recordInfo' },
        { id: 'errors', title: 'errors' }
    ]
});

// only if there are 4 parameters send to script file as follow
(async () => {

    if (PARAMS) {

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
                const jobName = row['jobName'];
                const regionalCommiteName = row['regionalCommiteName'];
                const dateOfHire = row['dateOfHire'];

                if (DEBUG) {
                    console.log('\x1b[36m%s\x1b[0m', 'runner.js file:')
                    console.log('user: ' + user);
                    console.log('pass: ' + pass);
                    console.log('idNumber: ' + idNumber);
                    console.log('jobName: ' + jobName);
                    console.log('regionalCommiteName: ' + regionalCommiteName);
                    console.log('dateOfHire: ' + dateOfHire + '\n');
                }

                // CS: execute registrar.js file (each one at the time)
                const cmd = `node crawler/registrar.js "${user}" "${pass}" "${idNumber}" "${jobName}" "${regionalCommiteName}" "${dateOfHire}"`;
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

                const record = 'EXEC --> ' + res[0].replace(/[\n]/gm, ' --> ') + 'END'; // record
                const errors = res[1]; // errors

                if (Number(errors) == 0) {

                    // success
                    data.push({
                        id: idNumber,
                        log: `applicant "${idNumber}" registered in the system successfully`,
                        record: record,
                        errors: errors
                    });
                }

                // (Number(errors) != 0)
                else {

                    // failed
                    data.push({
                        id: idNumber,
                        log: `failed to register applicant "${idNumber}"`,
                        record: record,
                        errors: errors
                    });
                }
            }
            catch (e) {

                console.log('runner.js: ' + e.message);

                // failed
                data.push({
                    id: idNumber,
                    log: `failed to execute the command "${cmd}"`,
                    record: e.message,
                    errors: '1'
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

    // args.length != 4
    else
        console.log('enter "user" and "passowrd" parameters only');
})();