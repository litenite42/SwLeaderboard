class Bot {
    constructor() {
        this.data = '';
    }
    
    sendMessage(query, data, title) {
        if (data.length){
            let Discord = require('discord.js'); // necessary discord js require to get the EmbedMessage definition
            const exampleEmbed = new Discord.MessageEmbed();

            exampleEmbed.setDescription(title);
            exampleEmbed.addField('Details', 'XP               Kills     Deaths    KDR    HS      Streak     Rounds     Wins    Last Active', false);

            for (let i = 0, j = 11; j < data.length + 11; i += 1, j+=11) 
            {
                let player = data.slice(i * 11, j);
                exampleEmbed.addField(`${player[0]}) ${player[1]}`, player.slice(2).join(' '), false);
            }

            return query.channel.send({embed: exampleEmbed});
        }
        query.channel.send("An error occurred. No Data was retrieved.")
    }
}

module.exports = Bot;