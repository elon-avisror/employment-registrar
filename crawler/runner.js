const fs = require('fs');
const loader = require('csv-load-sync');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const child_process = require('child_process')

/**
 * args[0]: node (command)
 * args[1]: runner.js filename)
 * args[2]: user (string)
 * args[3]: pass (string)
 */
const args = process.argv;

// input and output files
const READ = 'src/example.csv';
const WRITE = 'src/log.csv';
const DEV = true;

const csvReader = loader(READ);

// log.csv head content
const csvWriter = createCsvWriter({
    path: WRITE,
    header: [
        { id: 'id', title: 'IDNumber' },
        { id: 'log', title: 'LogInfo' },
        { id: 'status', title: 'Status'}
    ]
});

// only if there are 4 parameters send to script file as follow
// TODO: args.length == 4

(async () => {

    if (DEV) {

        // in production
        //const user = args[2];
        //const pass = args[3];

        // in develop
        const user = "jenya0025";
        const pass = "fvs3T73%T6";
        const data = [];

        csvReader.forEach(row => {

            // main code (for each row in applicants.csv file)
            try {

                // CS: execute registrar.js file (each one at the time)
                let cmd = `node crawler/registrar.js ${user} ${pass} ${row}`;
                let res = child_process.execSync(cmd, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                        // node couldn't execute the command
                        return;
                    }
 
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
 
                    // success
                    data.push({
                        id: row['IDNumber'],
                        log: `applicant ${row['IDNumber']} registered in the system successfully`,
                        status: res
                    });
                });
 
                console.log(res);
            
            }
            catch (e) {

                console.log('runner.js: ' + e.message);

                // failed
                data.push({
                    id: row['IDNumber'],
                    log: e.message,
                    status: res
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