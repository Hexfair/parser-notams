import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import date from 'date-and-time';
import icaoAll from './icao-all.js';
import icaoMy from './icao-my.js';
import unflat from './unflat.js';
import alert from 'alert';
//==============================================================================================================
const params = process.argv[2];
const lastFile = process.argv[3];
const regex = new RegExp(/\t/, 'ig');
const regex2 = new RegExp(/\n/, 'ig');
const regex3 = new RegExp(/\r/, 'ig');
//==============================================================================================================
// 2023-05-14_10.01_notams.txt
let aaa = '';
let arrLast;

lastFile && fs.readFile(`./output/${lastFile}`, "utf8", (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	arrLast = data.replace(regex3, '').split('\n');
})

const qqq = (str, icaoCode) => {
	if (!arrLast.includes(str)) {
		aaa = aaa + `-----${icaoCode}-----\r\n${str}` + "\r\n\r\n";
	}
}


const initailArrIcaoCodes = params === 'my' ? unflat(icaoMy.split(', '), 50) : unflat(icaoAll.split(', '), 50);
let j = 0;
let arrJson = [];
let stringTxt = '';

const timerId = setInterval(() => {
	console.log(`Загрузка ${j + 1} из ${initailArrIcaoCodes.length} ...`);
	if (j < initailArrIcaoCodes.length) {
		fetch(initailArrIcaoCodes[j]);
		j = j + 1;
	}
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
					const str = $(this).text().replace(regex, '').replace(regex2, '');
					notamArr.push(str);
					stringTxt = stringTxt + `-----${icaoCode}-----\r\n${str}` + "\r\n\r\n";

					lastFile && qqq(str, icaoCode);

				});

				let item = {
					icaoCode: icaoCode,
					icaoNotams: notamArr
				};
				arrJson.push(item);
			}
		}
	}

	if (j >= initailArrIcaoCodes.length) {
		const now = new Date();
		const dateParse = date.format(now, 'YYYY-MM-DD_HH.mm');

		fs.writeFile(`./output/${dateParse}_notams.json`, JSON.stringify(arrJson, null, 2), (err) => {
			if (err) {
				console.error(err);
				alert('Произошла ошибка создания файла json...');
				return;
			}
			alert(`Загрузка успешно завершена! Сохранен файл "${dateParse}_notams.json"`);
		});

		fs.writeFile(`./output/${dateParse}_notams.txt`, stringTxt, (err) => {
			if (err) {
				console.error(err);
				alert('Произошла ошибка создания файла txt...');
				return;
			}
			alert(`Загрузка успешно завершена! Сохранен файл "${dateParse}_notams.txt"`);
		});


		lastFile && fs.writeFile(`./output/${dateParse}_notams_new.txt`, aaa, (err) => {
			if (err) {
				console.error(err);
				alert('Произошла ошибка создания файла txt...');
				return;
			}
			alert(`Загрузка успешно завершена! Сохранен файл "${dateParse}_notams_new.txt"`);
		});

		clearInterval(timerId);
		console.log("Finish");
	}
}

fetch();

//const icaoDB4 = icaoDB.split(', ').filter(obj => obj.length === 4);


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