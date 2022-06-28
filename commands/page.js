function mod(n, m) {
    return ((n % m) + m) % m; // taken from: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm for explanation of negative modules in js
}


        let BOT = require('../bot.js');
        let bot = new BOT();

let short_length_aliases = ['s', 'st', 'short'];

module.exports = {
    name: 'page',
    description: 'Get certain page of players from the leaderboard',
    args: true,
    usage: '<page_nbr> [length_mod(' + short_length_aliases.join() + ')] [season_mod('+bot.season_aliases.join()+') season#] [year_mod('+bot.year_aliases.join()+') year#]',
    short_aliases: short_length_aliases,
	year_aliases: bot.year_aliases,
	season_aliases: bot.season_aliases,
    aliases: ['p', 'pg'],
    extended_usage: '- page_nbr [negative indices welcome] is required, while length_mod defaults to long\n- Use *s,st,or short* for short descriptions\n Seasons 1-4\n Year 2021-Current\nThe first recorded season is 2021s3',
    async execute(message, args) {
        const jsdom = require('jsdom'); // node doesn't support dom natively, so import a dom parser
        const {
            JSDOM
        } = jsdom;
        const fetch = require('node-fetch'); // not gonna lie just looked up node http requests. didn't see it had them native til later :/
        const querystring = require('querystring'); // can be useful if you want to be careful w/ passing of parameters

        let result = '';
        let page = args.shift();
        let page_number_msg = 'Currently, only pages 1-10 [and their negatives] are available!'
		if (!page && !Number.isNaN(page)) {
			return message.channel.send(this.usage + '\nYou did not enter page number! ' + page_number_msg);
		}

		let page_abs = Math.abs(page);
        if (page_abs < 1 || page_abs > 10) {
            return message.channel.send(this.usage + '\nIncorrect page number entered! ' + page_number_msg)
        }

        page = mod(page, 11);

        let shortNdx = this.short_aliases.map((a) => args.indexOf(a)).filter((a) => a !== -1);

        let short = !bot.isEmptyArray(shortNdx);

        if (short) 
        {
        	args.splice(shortNdx[0], 1);
        }

		let url = bot.buildLeaderboardURL(args);

        result = await fetch(`${url}?page=${page}`).then(r => r.text()); // get the page using the correct page number

        const document = new JSDOM(result).window.document; // create a virtual dom from the page

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent); // get an array of all the data cells in the table

        bot.sendLeaderPage(message, data, `[Leaderboard Page ${page}](${bot.convertToWebpageUrl(url)})`, short);
    },
};
