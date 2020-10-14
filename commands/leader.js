module.exports = {
	name: 'leader',
	description: 'Get [count] players from the leaderboard',
	async execute(message, args) {
        let url = 'https://skillwarz.com/modern/leaderboard.php';
        const jsdom = require('jsdom');
        const {JSDOM} = jsdom;
        const fetch = require('node-fetch');
        const querystring = require('querystring');
        let Discord = require('discord.js');
        const exampleEmbed = new Discord.MessageEmbed();
        let result = '';
        console.log(args[0])
        if (args[0] == 'page') {
            if (!args[1] && !Number.isNaN(args[1])) {
                return message.channel.send('You did not enter page number! Currently, only pages 1-10 are available!');
            }
            let final_url = `${url}?page=${args[1]}`;
            result = await fetch(`${url}?page=${args[1]}`).then(r => r.text());
            console.log(final_url)
        }

        const document = new JSDOM(result).window.document;

        let data = Array.prototype.slice.call(document.querySelectorAll('tbody tr td')).map(f => f.textContent);

        let players = [];
        if (data.length){
            exampleEmbed.addField(`Leaderboard Page ${args[1]}`, 'XP               Kills     Deaths    KDR    HS      Streak     Rounds     Wins    Last Active', false);
        }
        for (i = 0, j = 11; j < data.length + 11; i += 1, j+=11) 
        {
            let player = data.slice(i * 11, j);
            exampleEmbed.addField(`${player[0]}) ${player[1]}`, player.slice(2).join(' '), false);
        }
    

        message.channel.send({embed: exampleEmbed});
	},
};