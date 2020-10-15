module.exports = {
	name: 'page',
	description: 'Get [count] players from the leaderboard',
	async execute(message, args) {
        let url = 'https://skillwarz.com/modern/leaderboard.php'; // url for the sw leaderboard (can be found using any browser's dev tools Network tab)
        const jsdom = require('jsdom'); // node doesn't support dom natively, so import a dom parser 
        const {JSDOM} = jsdom;
        const fetch = require('node-fetch'); // not gonna lie just looked up node http requests. didn't see it had them native til later :/
        const querystring = require('querystring'); // can be useful if you want to be careful w/ passing of parameters
        
        let result = '';
        let page = args[0];

        if (!page && !Number.isNaN(page)) {
            return message.channel.send('You did not enter page number! Currently, only pages 1-10 are available!');
        }
        if (page < 1)
            page = 11 + Number(page); // allow referencing from the end (page 10 == page -1)
            
        result = await fetch(`${url}?page=${page}`).then(r => r.text()); // get the page using the correct page number

        const document = new JSDOM(result).window.document; // create a virtual dom from the page

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent); // get an array of all the data cells in the table

        let BOT  = require('../bot.js');
        let bot = new BOT();

        bot.sendMessage(message, data, `[Leaderboard Page ${page}](${url.replace('modern/', '')})`);
	},
};