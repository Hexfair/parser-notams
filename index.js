import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import date from 'date-and-time';
import icaoDB from './icaoDB.js';
import unflat from './unflat.js';
import alert from 'alert';
//==============================================================================================================
const regex = new RegExp(/\t/, 'ig');
const regex2 = new RegExp(/\n/, 'ig');
//==============================================================================================================

//const icaoDB4 = icaoDB.split(', ').filter(obj => obj.length === 4);

const initailArrIcaoCodes = unflat(icaoDB.split(', '), 50);
let j = 0;
let arrJson = [];
let stringTxt = '';

const timerId = setInterval(() => {
	console.log(`Загрузка ${j + 1} из ${initailArrIcaoCodes.length} ...`);
	fetch(initailArrIcaoCodes[j]);
	j = j + 1;
}, 10000);

const fetch = async (codes) => {
	const { data } = await axios.get(`https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=Report&retrieveLocId=${codes}&actionType=notamRetrievalByICAOs&submit=View+NOTAMs`);
	const $ = cheerio.load(data);
	const elements = $("form div table tbody tr td table");

	for (let i = 1; i < elements.length; i++) {
		if (i % 2 !== 0) {
			let icaoElem = $(elements[i]).find(".textBlack12Bu a")[0];
			let icaoCode = $(icaoElem).text().replace(regex, '').replace(regex2, '').trim();
			let notamArr = [];
			let notamElems = $(elements[i + 1]).find(".textBlack12 pre");

			if (notamElems.length > 0) {
				$(notamElems).each(function () {
					notamArr.push($(this).text().replace(regex, ''));
					stringTxt = stringTxt + `${icaoCode}\r\n${$(this).text().replace(regex, '')}` + "\r\n\r\n";
				});

				let item = {
					icaoCode: icaoCode,
					icaoNotams: notamArr
				};
				arrJson.push(item);
			}
		}
	}

	if (j === initailArrIcaoCodes.length) {
		const now = new Date();
		const dateParse = date.format(now, 'YYYY-MM-DD_HH.mm');

		fs.writeFile(`${dateParse}_notams.json`, JSON.stringify(arrJson, null, 2), (err) => {
			if (err) {
				console.error(err);
				alert('Произошла ошибка создания файла json...');
				return;
			}
			alert(`Загрузка успешно завершена! Сохранен файл "${dateParse}_notams.json"`);
		});

		fs.writeFile(`${dateParse}_notams.txt`, stringTxt, (err) => {
			if (err) {
				console.error(err);
				alert('Произошла ошибка создания файла txt...');
				return;
			}
			alert(`Загрузка успешно завершена! Сохранен файл "${dateParse}_notams.txt"`);
		});

		clearInterval(timerId);
		console.log("Finish");
	}
}

fetch();



// fs.writeFile("pokemon.json", JSON.stringify(pokemonData, null, 2), (err) => {
// 	if (err) {
// 		console.error(err);
// 		return;
// 	}
// 	console.log("Data written to file successfully!");
// });

//https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=Report&retrieveLocId=kzma+paza&actionType=notamRetrievalByICAOs&submit=View+NOTAMs


	//const element = ".textBlack12 pre";
	// $(element).each(function () {
	// 	const link = $(this);
	// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', link)
	// });


	// const arr = Array.from($(element))
	// console.log(arr.length)
	// $(element).each(function () {
	// 	const link = $(this);

	// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', link.length)
	// });


	// .then((arr) => {
	// 	const now = new Date();
	// 	const dateParse = date.format(now, 'YYYY-MM-DD');

	// 	fs.writeFile(`${dateParse}_notams.json`, JSON.stringify(arr, null, 2), (err) => {
	// 		if (err) {
	// 			console.error(err);
	// 			return;
	// 		}
	// 		console.log("Data written to file successfully!");
	// 	});
	// 	console.log("Finish")
	// })

	// const start = async () => {
// 	const codesList = icaoDB;
// 	await fetch(codesList);

// }