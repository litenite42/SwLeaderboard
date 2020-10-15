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
        let page_number_msg = 'Currently, only pages 1-10 [and their negatives] are available!'
        if (!page && !Number.isNaN(page)) {
            return message.channel.send('You did not enter page number! '+page_number_msg );
        }

        let page_abs = Math.abs(page);
        if (page_abs < 1 || page_abs > 10) {
            return message.channel.send('Incorrect page number entered! '+page_number_msg)
        }
        
        let BOT  = require('../bot.js');
        let bot = new BOT();

        function mod(n, m) {
            return ((n % m) + m) % m;
        }

        page = mod(page, 11);
            
        result = await fetch(`${url}?page=${page}`).then(r => r.text()); // get the page using the correct page number

        const document = new JSDOM(result).window.document; // create a virtual dom from the page

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent); // get an array of all the data cells in the table

        bot.sendMessage(message, data, `[Leaderboard Page ${page}](${url.replace('modern/', '')})`);
	},
};