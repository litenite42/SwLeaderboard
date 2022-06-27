let Discord = require('discord.js');
let invis_space = '\u200B';

let min_season_nbr = 1,
    max_season_nbr = 4,
    min_year = 2021,
    date = new Date(),
    max_year = date.getFullYear(),
    current_season = Math.floor(date.getMonth() / 3) + 1

class Bot {
    constructor() {
        this.data = '';
        this.detailsHeaders = {
            separator: '\u2003',
            short: ['XP', 'KDR', 'Win %'],
            long: ['XP', 'Kills', 'Deaths', 'KDR', 'HS', 'Streak', 'Win %', 'Last Active']
        }
    }

    sendPlayerCard(query, data, title, short) {
        if (data.length) {
            // necessary discord js require to get the EmbedMessage definition
            const responseEmbed = new Discord.MessageEmbed();

            responseEmbed.setDescription(title);

            let player = new Player(data);

            let embed = player.PlayerCard(responseEmbed);

            return query.channel.send({
                embed: embed
            });
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
        if (data.length) {
            //   let Discord = require('discord.js'); // necessary discord js require to get the EmbedMessage definition
            let responseEmbed = this.initLeaderPage(title + ' pt. 1', short);

            for (let i = 0, j = 11; j < data.length + 11; i += 1, j += 11) {
                let player = new Player(data.slice(i * 11, j));
                let description = '';
                if (!!short) {
                    description = player.shortDescription(this.detailsHeaders.separator);
                } else {
                    description = player.longDescription(this.detailsHeaders.separator);
                }
                if (i == 10) {
                    query.channel.send({
                        embed: responseEmbed
                    });
                    responseEmbed = this.initLeaderPage(title + ' pt. 2', short);
                }
                responseEmbed.addField(`${player.rank}) ${player.user}`, description, false);
            }

            return query.channel.send({
                embed: responseEmbed
            });
        }
        query.channel.send("An error occurred. No Data was retrieved.")
    }
    isNum(x) {
        const result = !isNaN(x),
              boolReplace = !result ? ' NOT ' : ' ';

        return result;
    }

    isEmptyArray(arr) {
        return Array.isArray(arr) && !arr.length;
    }

    determineSeason(seasonNbr) {
        let OPTION = require('./option.js');

        let result = new OPTION();
        result.default = current_season.toString();

        if (this.isNum(seasonNbr)) {
            seasonNbr = +seasonNbr;
            if (seasonNbr >= min_season_nbr && seasonNbr <= max_season_nbr) {
                result.value = `S${seasonNbr}`;
            } else {
                result.hasError = true;
                result.msg = `Season must be in the interval [${min_season_nbr},${max_season_nbr}].`;
            }       
        }

        return result;
    }

    determineYear(yearNbr) {
        let OPTION = require('./option.js');
        
        let result = new OPTION();
        result.default = max_year.toString();

        if (this.isNum(yearNbr)) {
            yearNbr = +yearNbr;

            if (yearNbr >= min_year && yearNbr <= max_year) {
                result.value = yearNbr.toString();
            } else {
                result.hasError = true;
                result.msg = `Year must be in the interval [${min_year},${max_year}]`;
            }
        }

        return result;
    }

    buildLeaderboardURL(args) {

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
        embed.addField(invis_space, '**Round Stats**', false);
        embed.addField('Total', this.rounds_played.format(), true);
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

        return [exp, kills, deaths, kd, hs, streak, wr, last_active].join(separator);
    }
}

module.exports = Bot;
