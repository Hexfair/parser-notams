const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const date = require('date-and-time');
const icaoDB = require('./icaoDB.js');
const codesList = icaoDB;
const fetch = async (codesList) => {
	axios
		.get(`https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=Report&retrieveLocId=${codesList}&actionType=notamRetrievalByICAOs&submit=View+NOTAMs`)
		.then((response) => {
			let arr = [];
			const $ = cheerio.load(response.data);
			const elements = $("form div table tbody tr td table");

			//const element = ".textBlack12 pre";
			// $(element).each(function () {
			// 	const link = $(this);
			// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', link)
			// });


			for (let i = 1; i < elements.length; i++) {
				if (i % 2 !== 0) {
					let icaoElem = $(elements[i]).find(".textBlack12Bu a")[0];
					let icaoCode = $(icaoElem).text();

					let notamArr = [];
					let notamElems = $(elements[i + 1]).find(".textBlack12 pre");

					$(notamElems).each(function () {
						notamArr.push($(this).text());
					});

					let item = {
						icaoCode: icaoCode,
						icaoNotams: notamArr
					};
					arr.push(item);
					console.log(item)
				}

			}
			return arr;
			// const arr = Array.from($(element))
			// console.log(arr.length)
			// $(element).each(function () {
			// 	const link = $(this);

			// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', link.length)
			// });

		})
		.then((arr) => {
			const now = new Date();
			const dateParse = date.format(now, 'YYYY-MM-DD');

			fs.writeFile(`${dateParse}_notams.json`, JSON.stringify(arr, null, 2), (err) => {
				if (err) {
					console.error(err);
					return;
				}
				console.log("Data written to file successfully!");
			});
			console.log("Finish")
		})
}

// const start = async () => {
// 	const codesList = icaoDB;
// 	await fetch(codesList);

// }

fetch()



// fs.writeFile("pokemon.json", JSON.stringify(pokemonData, null, 2), (err) => {
// 	if (err) {
// 		console.error(err);
// 		return;
// 	}
// 	console.log("Data written to file successfully!");
// });

//https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=Report&retrieveLocId=kzma+paza&actionType=notamRetrievalByICAOs&submit=View+NOTAMs