const createCsvWriter = require('csv-writer').createObjectCsvWriter; 

const csvWriter = createCsvWriter({  
  path: 'src/log.csv',
  header: [
    {id: 'id', title: 'IDNumber'},
    {id: 'log', title: 'Log'}
  ]
});

const data = [  
  {
    id: '305370801',
    log: 'success'
  }, {
    id: '206331795',
    log: 'error'
  }, {
    id: 'some id',
    log: 'some log'
  }
];

csvWriter  
  .writeRecords(data)
  .then(()=> console.log('The CSV file was written successfully'));