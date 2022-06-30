let BOT = require('../bot.js');
let bot = new BOT();

module.exports = {
    name: 'name',
    description: 'Get description of specified player.',
    args: true,
    usage: '<user_name> '+bot.seasonalOptionalParams(),
    aliases: ['n', 'nm'],
    extended_usage: '- Enter user_name of player in question\n- Search is case-sensitive, so: litenite and Litenite are not the same.\n'+bot.seasonalLeaderboardHelp("name"),
    async execute(message, args) {
        const jsdom = require('jsdom'); // node doesn't support dom natively, so import a dom parser
        const {
            JSDOM
        } = jsdom;
        const fetch = require('node-fetch'); // not gonna lie just looked up node http requests. didn't see it had them native til later :/

        let result = '';
        let name = args.shift();

        if (!name || !name.length || name.length < 3) {
            return message.channel.send(`Entered Username (${name}) was invalid.\nRemember that username\'s are case-sensitive.`);
        }
        
        let url = bot.buildLeaderboardURL(args);
        result = await fetch(url, {
            method: "post",
            body: 'search=' + name,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            //.then(r => { console.log(r); return r})
            .then(res => res.text())
            .then(json => json)
            .catch(err => console.log(err)); // get the name using the correct name number

        const document = new JSDOM(result).window.document; // create a virtual dom from the name

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td'))
            .map(f => f.textContent); // get an array of all the data cells in the table

        bot.sendPlayerCard(message, data, `Player Card`);
    },
};
