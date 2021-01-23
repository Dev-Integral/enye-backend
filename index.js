const express = require('express');
const app = express();
const https = require('https')
const port = 3000;
const bodyParser = require('body-parser');
const { query } = require('express');

let exchangeRate = '';

//get and set exchange rates!
let request = https.get('https://api.exchangeratesapi.io/latest', (res) => {
    if (res.statusCode !== 200) {
        console.error(`Couldn't get data`);
        res.resume();
        return;
    } else {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('close', () => {
            console.log('Retrieved all data');
            exchangeRate = (JSON.parse(data));
        });
        request.on('error', (err) => {
            console.error(`Encountered an error trying to make request:${err.message}`)
        })
    }
});

//body parser and routes
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/rates', (req, res) => {
    if (req.query.base && req.query.currency) {
        let rates = exchangeRate.rates;
        let updatedData = {};
            updatedData['date'] = exchangeRate.date;
            
        let currency = req.query.currency.split(',');

        let request = https.get(`https://api.exchangeratesapi.io/latest${req.query.base}`, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Couldn't get data`);
                res.resume();
                return;
            } else {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('close', () => {
                    console.log('Retrieved all data');
                    exchangeRate = (JSON.parse(data));
                    console.log(exchangeRate);
                });
                request.on('error', (err) => {
                    console.error(`Encountered an error trying to make request:${err.message}`)
                })
            }
        });

        const results = Object.keys(rates)
            .filter(key => currency.includes(key))
            .reduce((obj, key) => {
                obj[key] = rates[key];
                return obj;
            }, {});
        
        updatedData['base'] = req.query.base;
        updatedData['rates'] = results

        console.log(results, currency);

        return res.json({ 'results': updatedData });
    } else {
        return res.json({ 'results': exchangeRate });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});