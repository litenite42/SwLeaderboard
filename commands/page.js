function mod(n, m) {
    return ((n % m) + m) % m; // taken from: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm for explanation of negative modules in js
}
let short_length_aliases = ['s', 'st', 'short'],
	season_aliases = ['n', 'sn', 'season'],
	year_aliases = ['y', 'yr', 'year'];

let min_season_nbr = 1,
	max_season_nbr = 4,
	min_year = 2021,
	date = new Date(),
	max_year = date.getFullYear(),
	current_season = Math.floor(date.getMonth() / 3) + 1;
	
module.exports = {
    name: 'page',
    description: 'Get certain page of players from the leaderboard',
    args: true,
    usage: '<page_nbr> [length_mod(' + short_length_aliases.join() + ')]',
    short_aliases: short_length_aliases,
	year_aliases: year_aliases,
	season_aliases: season_aliases,
    aliases: ['p', 'pg'],
    extended_usage: '- page_nbr [negative indices welcome] is required, while length_mod defaults to long\n- Use *s,st,or short* for short descriptions',
    async execute(message, args) {
        let url = 'https://skillwarz.com/modern/leaderboard##YEAR####SEASON##.php'; // url for the sw leaderboard (can be found using any browser's dev tools Network tab)
        const jsdom = require('jsdom'); // node doesn't support dom natively, so import a dom parser
        const {
            JSDOM
        } = jsdom;
        const fetch = require('node-fetch'); // not gonna lie just looked up node http requests. didn't see it had them native til later :/
        const querystring = require('querystring'); // can be useful if you want to be careful w/ passing of parameters

        let result = '';
        let page = args[0];
        let page_number_msg = 'Currently, only pages 1-10 [and their negatives] are available!'
		if (!page && !Number.isNaN(page)) {
			return message.channel.send(this.usage + '\nYou did not enter page number! ' + page_number_msg);
		}

		let page_abs = Math.abs(page);
        if (page_abs < 1 || page_abs > 10) {
            return message.channel.send(this.usage + '\nIncorrect page number entered! ' + page_number_msg)
        }

        let BOT = require('../bot.js');
        let bot = new BOT();

        page = mod(page, 11);
		
		let yearText = '',
			seasonText = '';			
		let isNum = (x) => {
			console.log('entering is num');
			const result = !isNaN(x),
				  boolReplace = !result ? ' NOT ' : ' ';
			console.log('Value was'+boolReplace+'a num');
			return result;
		};
		
		console.log(args);
        let short = false;
		for (let ndx = 1; ndx < args.length; ndx++) {
			let arg = args[ndx];
			console.log({thisArg: arg})
			if (!!arg && this.short_aliases.includes(arg)) {
				short = true;
			} else if (!!arg && this.season_aliases.includes(arg)) {
				ndx++;
				
				let seasonNbr = args[ndx];
				console.log({season: seasonNbr})
				if (isNum(seasonNbr)) {
					seasonNbr = +seasonNbr;
					if (seasonNbr >= min_season_nbr && seasonNbr <= max_season_nbr) {
						seasonText = `S${seasonNbr}`;
					} else {
						return message.channel.send(`Season must be in the interval [${min_season_nbr},${max_season_nbr}].`);
					}
					
				} else {
					ndx--;
					seasonText = current_season.toString();
				}
			} else if (!!arg && this.year_aliases.includes(arg)) {
				ndx++;
				console.log({yeararg: arg})
				let yearNbr = args[ndx];
				console.log({yearVal: yearNbr})
				console.log({isANum: isNum(yearNbr)})
				if (isNum(yearNbr)) {
					yearNbr = +yearNbr;
					console.log(yearNbr);
					if (yearNbr >= min_year && yearNbr <= max_year) {
						yearText = yearNbr.toString();
					} else {
						return message.channel.send(`Year must be in the interval [${min_year},${max_year}]`);
					}
				} else {
						ndx--;
						yearText = max_year.toString();
				}
			}
		}
			
		console.log({yt: yearText});
		if (!!yearText) {
			yearText = `_${yearText}`;
		}
		
		if (!!seasonText) {
			seasonText = `_${seasonText}`;
		}
		
		url = url.replace('##YEAR##', yearText).replace('##SEASON##', seasonText);		
		console.log(url)
        result = await fetch(`${url}?page=${page}`).then(r => r.text()); // get the page using the correct page number

        const document = new JSDOM(result).window.document; // create a virtual dom from the page

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent); // get an array of all the data cells in the table

        bot.sendLeaderPage(message, data, `[Leaderboard Page ${page}](${url.replace('modern/', '')})`, short);
    },
};
