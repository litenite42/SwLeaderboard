let Discord = require('discord.js');
let invis_space = '\u200B';

class Bot {
    constructor() {
        this.data = '';
        this.detailsHeaders = {
            separator : '\u2003',
            short : ['XP','KDR','Win %'],
            long: ['XP', 'Kills','Deaths','KDR','HS','Streak','Win %','Last Active']
        }
    }

    sendPlayerCard(query, data, title, short) {
        if (data.length){
             // necessary discord js require to get the EmbedMessage definition
            const responseEmbed = new Discord.MessageEmbed();

            responseEmbed.setDescription(title);

            let player = new Player(data);

            let embed = player.PlayerCard(responseEmbed);

            return query.channel.send({embed: embed});
        }
        query.channel.send("An error occurred. No Data was retrieved.")
    }

    initLeaderPage(title, short) {
        const responseEmbed = new Discord.MessageEmbed();

        responseEmbed.setDescription(title);

        let header = this.detailsHeaders.long.join(this.detailsHeaders.separator);
        if (!!short) {
            header = this.detailsHeaders.short.join(this.detailsHeaders.separator);
        }
        responseEmbed.addField(invis_space, `**${header}**`, false);

        return responseEmbed;
    }

    sendLeaderPage(query, data, title, short) {
        if (data.length){
         //   let Discord = require('discord.js'); // necessary discord js require to get the EmbedMessage definition
            let responseEmbed = this.initLeaderPage(title+' pt. 1', short);

            for (let i = 0, j = 11; j < data.length + 11; i += 1, j+=11)
            {
                let player = new Player(data.slice(i * 11, j));
                let description = '';
                if (!!short) {
                    description = player.shortDescription(this.detailsHeaders.separator);
                }
                else {
                    description = player.longDescription(this.detailsHeaders.separator);
                }
                if (i == 10) {
                    query.channel.send({embed: responseEmbed});
                    responseEmbed = this.initLeaderPage(title+' pt. 2', short);
                }
                responseEmbed.addField(`${player.rank}) ${player.user}`, description , false );
            }

            return query.channel.send({embed: responseEmbed});
        }
        query.channel.send("An error occurred. No Data was retrieved.")
    }
}
var numeral = require('numeral');
class Player {
    constructor(data) {
        this.data = data.slice(2);
        this.rank = data[0];
        this.user = data[1];
        this.exp = numeral(data[2]);
        this.kills = numeral(data[3]);
        this.deaths = numeral(data[4]);
        this.kdr = data[5];
        this.headshots = numeral(data[6]);
        this.killstreak = numeral(data[7]);
        this.rounds_played = numeral(data[8]);
        this.rounds_won = numeral(data[9]);
        this.last_active = data[10];
    }

    PlayerCard(embed) {

        embed.addField('Name', this.user, true);
        embed.addField('XP', this.exp.format(), true);
        embed.addField(invis_space, '**Kill Stats**', false);
        embed.addField('K/D', this.kdr, true);
        embed.addField('Kills', this.kills.format(), true);
        embed.addField('Headshots', this.headshots.format(), true);
        embed.addField('Deaths', this.deaths.format(), true);
        embed.addField( invis_space,'**Round Stats**', false);
        embed.addField('Total', this.rounds_played.format() , true);
        embed.addField('Won', this.rounds_won.format('0,0 '), true);
        embed.addField('Last Active', this.last_active, true);

        return embed;
    }

    shortDescription(separator) {
        const exp = this.exp.format(),
              kd = this.kdr,
              win_rate = this.rounds_won.value() / this.rounds_played.value(),
              wr = numeral(win_rate).format('0.00%');
        return [exp, kd, wr].join(separator);
    }
    longDescription(separator) {
          const exp = this.exp.format(),
              kd = this.kdr,
              win_rate = this.rounds_won.value() / this.rounds_played.value(),
              wr = numeral(win_rate).format('0.00%'),
              kills = this.kills.format(),
              hs = this.headshots.format(),
              deaths = this.deaths.format(),
              streak = this.killstreak.value(),
              total = this.rounds_played.format(),
              last_active = this.last_active;

        return [exp,kills,deaths,kd,hs,streak,wr,last_active].join(separator);
    }
}

module.exports = Bot;
