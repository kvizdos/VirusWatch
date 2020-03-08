const request = require('request');
const cheerio = require('cheerio');

const aggregateData = (place, url, cb) => {
    return new Promise(resolve => {
        let cases = 0;
        request(url, (err, res, body) => {
            if (!err && res.statusCode == 200) {
                var $ = cheerio.load(body);
                cases = cb($);
                resolve({place: place, cases: cases});
            }
        });
    });
}

const getVAData = ($) => $("#panel-7569-0-0-0 > div > div > ul > li:nth-child(1) > strong").text().split(" ")[2]
const getNYData = ($) => $("#case_count_table > tbody > tr:nth-child(10) > td:nth-child(2)").text();
const getPennsylvaniaData = ($) => $("#ctl00_PlaceHolderMain_PageContent__ControlWrapper_RichHtmlField > ul:nth-child(4) > li:nth-child(1)").text().split(" ")[3].split("")[4];
const saveData = (info) => {
    const time = (+ new Date);
    console.log(`${time} | ${info.place} > ${info.cases}`)
}

const _VIRGINIA = aggregateData('Virginia', 'http://www.vdh.virginia.gov/surveillance-and-investigation/novel-coronavirus/', getVAData).then(saveData);
const _NEWYORK = aggregateData('New York', 'https://www.health.ny.gov/diseases/communicable/coronavirus/', getNYData).then(saveData);
const _Pennsylvania = aggregateData('Pennsylvania','https://www.health.pa.gov/topics/disease/Pages/Coronavirus.aspx',getPennsylvaniaData).then(saveData)

var zipcodes = require('zipcode');
const csv = require('csv-parser')
const fs = require('fs');
const allCases = [];

const registerData = () => {
    fs.createReadStream('data/03-07-2020.csv')
    .pipe(csv())
    .on('data', (data) => allCases.push(data))
    .on('end', () => {
    });
}

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
 }

// level 0 = exact (county + state)
// level 1 = state
const getData = (zip, level = 0) => {
    let info = zipcodes.lookup(zip.toString());

    if(info == null) {
        return {error: "invalid zip"};
    }
    info[0] = titleCase(info[0]);

    let stateLevel;
        cases = allCases.find(place => place['Province/State'] == info.join(',') || place['Province/State'] == `${info[0]} County, ${info[1]}`)
        let confirmed = 0;
        let deaths = 0;
        let recovered = 0;
        allCases.forEach(place => {
            if(place['Province/State'].indexOf(`, ${info[1]}`) >= 0) {
                confirmed += parseInt(place.Confirmed)
                deaths += parseInt(place.Deaths)
                recovered += parseInt(place.Recovered)
            }
        })

        stateLevel = {
            'Country/Region': info[1],
            'Confirmed': confirmed,
            'Deaths': deaths,
            'Recovered': recovered
        }

    return {regional: cases || {
        'Province/State': info[0],
        'Country/Region': info[1],
        'Confirmed': 0,
        'Deaths': 0,
        'Recovered': 0
    }, state: stateLevel };
}

exports.getData = getData;
exports.registerData = registerData;