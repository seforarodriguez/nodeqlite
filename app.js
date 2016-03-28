'use strict';

const express = require('express')
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/Chinook_Sqlite.sqlite');

const app = express();

const PORT =process.env.PORT || 3000;

console.log('# of invoices per country')

app.get('/sales-per-year', (req,res) => {
  //HOW MANY iNVOICES WERE THERE IN 2009 AND 2011?wHAT ARE THE RESPECTIVE TOTAL SALES FOR EACH OF THOSE YEARS?
  let having = '';

  if (req.query.filter) {
    having = 'HAVING';

    req.query.filter.year
      .split(',')
      .map(y => +y)
      .forEach(y => {
        having += ` year = "${y}" OR`;
      });

    having = having.substring(0, having.length - 3);
  }

  db.all(`
    SELECT    COUNT(*) as invoices,
              SUM(Total) as total,
              STRFTIME('%Y', InvoiceDate) as year
    FROM      Invoice
    GROUP BY  year
    ${having}`,
    (err, data) => {
      if (err) throw err;
      console.log(data)
      const roundedData = data.map(function (obj) {
        return {
          invoices:obj.invoices,
          year: +obj.year,
          total: +obj.total.toFixed(2)
        }
      });

      res.send({
        data: roundedData
      })
    }
  )
})

app.get('/invoices-by-country', (req, res) => {
  db.all(`
  SELECT    COUNT(*) AS count,BillingCountry AS country 
  FROM      Invoice 
  GROUP BY  BillingCountry
  ORDER BY count DESC`, 
    (err, data) => {
      if(err) throw err;

      res.send({
        data: data,
        info: '# of invoices per country'
      });
  });
})

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
})
