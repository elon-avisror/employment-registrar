const readXlsxFile = require('read-excel-file/node');
const PATH = 'C:/Users/a/Documents/projects/pwm/help/applicants.xlsx';

const file = readXlsxFile(PATH).then((rows) => {

    // `rows` is an array of rows
    // each row being an array of cells.

    // TODO: first row with the names of properties

    rows.forEach(row => {
        for (let i = 0; i < row.length; i++) {
            switch (i) {

                // IDNumber
                case 0:
                    console.log('id: ' + row[i]);
                    break;

                // FirstName
                case 1:
                    console.log('FirstName: ' + row[i]);
                    break;

                // LastName
                case 2:
                    console.log('LastName: ' + row[i]);
                    break;

                // email
                case 3:
                    console.log('email: ' + row[i]);
                    break;

                // TotalScore
                case 4:
                    console.log('TotalScore: ' + row[i]);
                    break;

                // JobCode
                case 5:
                    console.log('JobCode: ' + row[i]);
                    break;

                // קוד ועדה אזורית
                case 6:
                    console.log('קוד ועדה אזורית: ' + row[i]);
                    break;

                // שם ועדה אזורית
                case 7:
                    console.log('שם ועדה אזורית: ' + row[i]);
                    break;

                /* 
                // an error
                default:
                    throw new Error('Excel error');
                */
            }
        }
    });
});

console.log(file);