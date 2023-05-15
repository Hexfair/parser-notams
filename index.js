import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import date from 'date-and-time';
import icaoAll from './icao-all.js';
import icaoMy from './icao-my.js';
import alert from 'alert';
//==============================================================================================================
const params = process.argv[2];
const lastFileName = process.argv[3];
const regex1 = new RegExp(/\t/, 'ig');
const regex2 = new RegExp(/\n/, 'ig');
const regex3 = new RegExp(/\r/, 'ig');
//==============================================================================================================
let strAllNotams = '';
let strNewNotams = '';
let arrLast;
let j = 0;
//==============================================================================================================

console.log('Парсер запущен!');

fs.readdir('./output', function (err, items) {
	if (items.length === 0) {
		arrLast = [];
		return;
	}

	if (err) {
		console.error(err);
		alert(`Ошибка чтения файла ${items[items.length - 1]}...`);
		return;
	};

	const file = lastFileName ? `./output/${lastFileName}` : `./output/${items[items.length - 1]}`;
	console.log(`Для формирования файла с префиксом "new" будет происходить сравнение с файлом ${file}`);

	fs.readFile(file, "utf8", (err, data) => {
		if (err) {
			console.error(err);
			alert(`Ошибка чтения файла ${file}...`);
			return;
		};
		arrLast = data.replace(regex3, '').split('\n');
	})
});

const unflat = (src, count) => {
	const result = [];
	for (let s = 0, e = count; s < src.length; s += count, e += count)
		result.push(src.slice(s, e).join('+'));
	return result;
}

const createNewNotams = (str, icaoCode) => {
	if (!arrLast.includes(str)) {
		strNewNotams = strNewNotams + `-----${icaoCode}-----\r\n${str}` + "\r\n\r\n";
	}
}

const initailArrIcaoCodes = params === 'my' ? unflat(icaoMy.split(', '), 50) : unflat(icaoAll.split(', '), 50);

const timerId = setInterval(() => {
	if (j < initailArrIcaoCodes.length) {
		console.log(`Загрузка ${j + 1} из ${initailArrIcaoCodes.length} ...`);
		fetch(initailArrIcaoCodes[j]);
		j = j + 1;
	}
}, 15000);

const fetch = async (codes) => {
	try {
		const { data } = await axios.get(`https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=Report&retrieveLocId=${codes}&actionType=notamRetrievalByICAOs&submit=View+NOTAMs`);
		const $ = cheerio.load(data);
		const elements = $("form div table tbody tr td table");

		for (let i = 1; i < elements.length; i++) {
			if (i % 2 !== 0) {
				let icaoElem = $(elements[i]).find(".textBlack12Bu a")[0];
				let icaoCode = $(icaoElem).text().replace(regex1, '').replace(regex2, '').trim();
				let notamElems = $(elements[i + 1]).find(".textBlack12 pre");

				if (notamElems.length > 0) {
					$(notamElems).each(function () {
						const str = $(this).text().replace(regex1, '').replace(regex2, '');
						strAllNotams = strAllNotams + `-----${icaoCode}-----\r\n${str}` + "\r\n\r\n";

						createNewNotams(str, icaoCode);
					});
				}
			}
		}

		if (j >= initailArrIcaoCodes.length) {
			const now = new Date();
			const one_minutes_minus = date.addMinutes(now, -1);
			const dateParse = date.format(now, "YYYY-MM-DD_HH.mm");
			const dateParseNew = date.format(one_minutes_minus, "YYYY-MM-DD_HH.mm");

			fs.writeFile(`./output/${dateParseNew}_notams_new.txt`, strNewNotams, (err) => {
				if (err) {
					console.error(err);
					alert("Произошла ошибка создания файла new txt...");
					return;
				}
				alert(`Загрузка успешно завершена! Сохранен файл "${dateParseNew}_notams_new.txt"`);
			});

			fs.writeFile(`./output/${dateParse}_notams.txt`, strAllNotams, (err) => {
				if (err) {
					console.error(err);
					alert("Произошла ошибка создания файла txt...");
					return;
				}
				alert(`Загрузка успешно завершена! Сохранен файл "${dateParse}_notams.txt"`);
			});

			clearInterval(timerId);
			console.log("Работа программы завершена");
		}
	} catch (error) {
		console.log('Ошибка парсинга...');
		clearInterval(timerId);
	}
}