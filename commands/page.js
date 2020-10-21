function mod(n, m) {
    return ((n % m) + m) % m; // taken from: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm for explanation of negative modules in js
}
let short_length_aliases = ['s', 'st', 'short'];
module.exports = {
	name: 'page',
    description: 'Get certain page of players from the leaderboard',
    args: true,
    usage: '<page_nbr> [length_mod('+short_length_aliases.join()+')]',
    short_aliases : short_length_aliases,
    aliases: ['p', 'pg'],
    extended_usage: '- page_nbr [negative indices welcome] is required, while length_mod defaults to long\n- Use *s,st,or short* for short descriptions',
	async execute(message, args) {
        let url = 'https://skillwarz.com/modern/leaderboard.php'; // url for the sw leaderboard (can be found using any browser's dev tools Network tab)
        const jsdom = require('jsdom'); // node doesn't support dom natively, so import a dom parser 
        const {JSDOM} = jsdom;
        const fetch = require('node-fetch'); // not gonna lie just looked up node http requests. didn't see it had them native til later :/
        const querystring = require('querystring'); // can be useful if you want to be careful w/ passing of parameters
        
        let result = '';
        let page = args[0];
        let page_number_msg = 'Currently, only pages 1-10 [and their negatives] are available!'
        if (!page && !Number.isNaN(page)) {
            return message.channel.send(this.usage+'\nYou did not enter page number! '+page_number_msg );
        }

        let page_abs = Math.abs(page);
        if (page_abs < 1 || page_abs > 10) {
            return message.channel.send(this.usage+'\nIncorrect page number entered! '+page_number_msg)
        }

        let BOT  = require('../bot.js');
        let bot = new BOT();

        page = mod(page, 11);
            
        result = await fetch(`${url}?page=${page}`).then(r => r.text()); // get the page using the correct page number

        const document = new JSDOM(result).window.document; // create a virtual dom from the page

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent); // get an array of all the data cells in the table

        let short = false;

        if (!!args[1] && this.short_aliases.includes(args[1])){
            short = true;
        }

        bot.sendLeaderPage(message, data, `[Leaderboard Page ${page}](${url.replace('modern/', '')})`, short);
	},
};