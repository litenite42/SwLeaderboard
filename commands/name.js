module.exports = {
	name: 'name',
    description: 'Get description of specified player.',
    args: true,
    usage: '<user_name>\n- Enter user_name of player in question\n- Search is case-sensitive, so: litenite and Litenite are not the same',
	async execute(message, args) {
        let url = 'https://skillwarz.com/modern/leaderboard.php'; // url for the sw leaderboard (can be found using any browser's dev tools Network tab)
        const jsdom = require('jsdom'); // node doesn't support dom natively, so import a dom parser 
        const {JSDOM} = jsdom;
        const fetch = require('node-fetch'); // not gonna lie just looked up node http requests. didn't see it had them native til later :/
        const querystring = require('querystring'); // can be useful if you want to be careful w/ passing of parameters
        
        let result = '';
        let name = args[0];

        if (!name && !Number.isNaN(name)) {
            return message.channel.send('You did not enter name number! Currently, only pages 1-10 are available!');
        }
        
        let body = {
            search : name
        }
        result = await fetch(`${url}`, {
            method: "post",
            body: 'search='+name,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          })
          //.then(r => { console.log(r); return r})
          .then(res => res.text())
          .then(json => json)
          .catch(err => console.log(err)); // get the name using the correct name number

        const document = new JSDOM(result).window.document; // create a virtual dom from the name

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent); // get an array of all the data cells in the table

        let BOT  = require('../bot.js');
        let bot = new BOT();

        bot.sendPlayerCard(message, data, `Player Card`);
	},
};