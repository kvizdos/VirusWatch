// Install body-parser and Express
const express = require('express')
const app = express()
const port = 80;

const path = require('path')

const bodyParser = require('body-parser')
const _DH = require('../helpers/getdata');

// Use req.query to read values!!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, '/../frontend/assets')))

app.get('/', (req, res) => res.sendFile('index.html', {root: __dirname + '/../frontend'}))

_DH.registerData();

app.get('/api/lookup', (req, res) => {
    const zip = req.query.zip;
    const level = req.query.level || 0;

    res.json(_DH.getData(zip, level));
})

app.listen(port, () => console.log('VirusWatch running on port ' + port))