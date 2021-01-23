const express = require('express');
const app = express();
const https = require('https')
const port = 3000;
const bodyParser = require('body-parser');

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
            console.log(exchangeRate);
        });
        request.on('error', (err) => {
            console.error(`Encountered an error trying to make request:${err.message}`)
        })
    }
});

//body parser and routes
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/rates', (req, res) => {
    if (req.query.base) {
        let rates = exchangeRate.rates

        const allowed = ['EUR', 'CZK','KRW']
        const results = Object.keys(rates)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => {
            obj[key]= rates[key];
            return obj;
        }, {});
        
        console.log(results);

        return res.json({ 'results': results });
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