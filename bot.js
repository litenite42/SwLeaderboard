class Bot {
    constructor() {
        this.data = '';
        this.detailsHeaders = {
            separator : '\u2003',
            short : ['XP','KDR','Rounds Won'],
            long: ['XP', 'Kills','Deaths','KDR','HS','Streak','Rounds Wins','Last Active']
        }
    }
    
    sendMessage(query, data, title, short) {
        if (data.length){
            let Discord = require('discord.js'); // necessary discord js require to get the EmbedMessage definition
            const exampleEmbed = new Discord.MessageEmbed();

            exampleEmbed.setDescription(title);
            
            let header = this.detailsHeaders.long.join(this.detailsHeaders.separator);
            if (!!short) {
                header = this.detailsHeaders.short.join(this.detailsHeaders.separator);
            }
            exampleEmbed.addField('Details', header, false);

            for (let i = 0, j = 11; j < data.length + 11; i += 1, j+=11) 
            {
                let player = new Player(data.slice(i * 11, j));
                let description = '';
                if (!!short) {
                    description = player.shortDescription(this.detailsHeaders.separator)
                }
                else {
                    description = player.longDescription(this.detailsHeaders.separator);
                }
                exampleEmbed.addField(`${player.rank}) ${player.user}`, description , false );
            }

            return query.channel.send({embed: exampleEmbed});
        }
        query.channel.send("An error occurred. No Data was retrieved.")
    }
}

class Player {
    constructor(data) {
        this.data = data.slice(2);
        this.rank = data[0];
        this.user = data[1];        
        this.exp = data[2];
        this.kills = data[3];
        this.deaths = data[4];
        this.kdr = data[5];
        this.headshots = data[6];
        this.killstreak = data[7];
        this.rounds_played = data[8];
        this.rounds_won = data[9];
        this.last_active = data[10];
    }

    shortDescription(separator) {
        return [this.exp, this.kdr, this.rounds_won].join(separator);
    }
    longDescription(separator) {
        return this.data.join(separator);
    }
}

module.exports = Bot;