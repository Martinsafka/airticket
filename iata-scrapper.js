const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL adresy
const airlinesUrl = 'https://cs.wikipedia.org/wiki/Seznam_k%C3%B3d%C5%AF_leteck%C3%BDch_spole%C4%8Dnost%C3%AD_IATA';
const airportsUrl = 'https://cs.wiktionary.org/wiki/P%C5%99%C3%ADloha:IATA_k%C3%B3dy_leti%C5%A1%C5%A5';

async function scrapeAirlines() {
    const response = await axios.get(airlinesUrl);
    const $ = cheerio.load(response.data);
    const lists = $('div.mw-parser-output > ul');

    let airlines = {};

    // Procházíme každý seznam, který je potomkem divu s třídou mw-parser-output
    lists.each((index, ul) => {
        $(ul).find('li').each((index, li) => {
            const link = $(li).find('a').first();
            const code = link.text().trim();
            const name = $(li).text().replace(code, '').replace(':', '').trim();

            if (code && name) {
                airlines[code] = name;
            }
        });
    });

    fs.writeFileSync('airlines.json', JSON.stringify(airlines, null, 4), 'utf8');
    console.log('Airlines data saved to airlines.json');
}

async function scrapeAirports() {
    const response = await axios.get(airportsUrl);
    const $ = cheerio.load(response.data);
    const table = $('table.wikitable');

    let airports = {};

    table.find('tr').each((index, element) => {
        const tds = $(element).find('td');
        if (tds.length >= 2) {
            const code = $(tds[0]).text().trim();
            const name = $(tds[1]).text().trim();
            if (code && name) {
                airports[code] = name;
            }
        }
    });

    fs.writeFileSync('airports.json', JSON.stringify(airports, null, 4), 'utf8');
    console.log('Airports data saved to airports.json');
}

async function main() {
    await scrapeAirlines();
    await scrapeAirports();
}

main();
