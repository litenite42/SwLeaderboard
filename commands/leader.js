module.exports = {
	name: 'leader',
	description: 'Get [count] players from the leaderboard',
	async execute(message, args) {
        let url = 'https://skillwarz.com/modern/leaderboard.php';
        const jsdom = require('jsdom');
        const {JSDOM} = jsdom;
        const fetch = require('node-fetch');
        const querystring = require('querystring');
        let result = '';
        console.log(args[0])
        if (args[0] == 'page') {
            if (!args[1] && !Number.isNaN(args[1])) {
                return message.channel.send('You did not enter page number! Currently, only pages 1-10 are available!');
            }
            let final_url = `${url}?page=${args[1]}`;
            result = await fetch(`${url}?page=${args[1]}`).then(r => r.text());

        }
        else if (args[0] == 'name')
        {
            console.log('name')
            if (!args[1] && !!args[1].length) {
                return message.channel.send('You did not enter a username! Usernames are case-sensitive, so Litenite and litenite are not equal!');
            }
            console.log(args[1])
            let body = {
                search : args[1]
            }
            result = await fetch(url, {
                method: "POST",
                body: `search=${args[1]}`//JSON.stringify(body),
              //  headers: { "Content-Type": "text/html" }
            }).then(r => r.text());

            console.log(result)
        }

        const document = new JSDOM(result).window.document;

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent);

        let players = [];

        for (i = 0, j = 11; j < data.length + 11; i += 1, j+=11) 
        {
            players.push(data.slice(i * 11, j).join(' '));
        }

        //console.log({query : {url: final_url, result: players /*.forEach(f => f.textContent)*/}});


        message.channel.send(players);
	},
};