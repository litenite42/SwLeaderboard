let Discord = require('discord.js');
var columnify = require('columnify')

let invis_space = '\u200B';
let leaderboardUrl = 'https://skillwarz.com/modern/leaderboard##YEAR####SEASON##.php';

let min_season_nbr = 1,
    max_season_nbr = 4,
    min_year = 2021,
    date = new Date(),
    max_year = date.getFullYear(),
    current_season = Math.floor(date.getMonth() / 3) + 1;

class Bot {
    season_aliases = ['n', 'sn', 'season'];
    year_aliases = ['y', 'yr', 'year'];

    constructor() {
        this.data = '';
        this.url = '';
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

    sendLeaderPage(query, data, page, short) {
        if (data.length) {
            let players = [];
            let part = 1;
            for (let i = 0, j = 11; j < data.length + 11; i += 1, j += 11) {
                let player = new Player(data.slice(i * 11, j));
                let description = {};

                if (!!short) {
                    description = player.shortDescription();
                } else {
                    description = player.longDescription();
                }

                players.push(description);
                
                if (this.mod(players.length, 10) == 0) {
                    let table = columnify(players,
                        { 
                            columnSplitter: ' | ', 
                            align: 'right',
                            headingTransform: function(heading) {
                                return heading.toUpperCase();
                            },
                            config: {
                                Name: {
                                    align: 'left'
                                }
                            }
                        });

                    let title = this.buildLeaderboardTitle(page, part++);
                    query.channel.send(`${title}\n\`\`\`${table}\`\`\``);
                    players = [];
                }
            }

            return;
        }
        query.channel.send("An error occurred. No Data was retrieved.")
    }
    isNum(x) {
        const result = !isNaN(x),
              boolReplace = !result ? ' NOT ' : ' ';

        return result;
    }

    mod(n, m) {
        return ((n % m) + m) % m; // taken from: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm for explanation of negative modules in js
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
                result.value = `${seasonNbr}`;
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
        let yearText = '',
            seasonText = '';
        
        for (let ndx = 0; ndx < args.length; ndx++) {
            let arg = args[ndx];
            
            if (!!arg && this.season_aliases.includes(arg)) {
                ndx++;
                let seasonNbr = args[ndx];

                let seasonResult = this.determineSeason(seasonNbr);
                let seasonValue = seasonResult.getValueWithOffset();

                if (seasonValue.offset) {
                    ndx--;
                }

                seasonText = seasonValue.value;
            } else if (!!arg && this.year_aliases.includes(arg)) {
                ndx++;
                let yearNbr = args[ndx];

                let yearResult = this.determineYear(yearNbr);
                let year = yearResult.getValueWithOffset();

                if (year.offset){
                    ndx--;
                }

                yearText = year.value;
            }
        }

        if (!!yearText) {
            yearText = `_${yearText}`;
        } else if (!!seasonText) {
            yearText = `_${max_year}`;
        }
        
        if (!!seasonText) {
            seasonText = `_S${seasonText}`;
        } else if (!!yearText) {
            seasonText = `_S${current_season}`;
        }

        let url = leaderboardUrl.replace('##YEAR##', yearText).replace('##SEASON##', seasonText);
        this.url = url;
    }

    buildLeaderboardTitle(page, part) {
        let _url = this.url;
        let title = `**__Leaderboard ##SEASONAL##Page ${page} pt. ${part}__**\n<${this.convertToWebpageUrl(this.url)}>`;
        let season_replace = '';

        if (_url.indexOf('_') !== -1) { // extract season info from url to place in title
            let seasonal_info = _url.slice(_url.indexOf('_')+1).split('_').map((el) => el.split('.')[0]);
            season_replace = seasonal_info.join(' ')+' ';            
        }

        title = title.replace('##SEASONAL##', season_replace);
        return title;
    }

    convertToWebpageUrl(url) {
        return url.replace('modern/', '');
    }

    seasonalOptionalParams() {
        let optionalParams = `[season_mod(${this.season_aliases.join(', ')}) season#] [year_mod(${this.year_aliases.join(', ')}) year#]`;

        return optionalParams;
    }

    seasonalLeaderboardHelp(commandName) {
        let helpText = 
`- season_mod and year_mod are optional parameters used separately (or together) to modify which leaderboard results will be pulled from.
~ Available Values:
    + Seasons 1-4
    + Year 2021-Current
~ Defaults:
    + If neither parameter is received (swlb ${commandName} 1),
        the overall leaderboard will be used.
    + If only the season parameter is present (swlb ${commandName} 1 n 2),
        the specified seasonal leaderboard for the CURRENT year will be pulled.
    + If only the year parameter is present (swlb ${commandName} 1 y 2022),
        the specified year's current seasonal leaderboard will be pulled.

~ The first recorded season is y 2021 n 3`;

        return helpText;

    }
}


var numeral = require('numeral');
class Player {
    constructor(data) {
        this.detailsHeaders = {
            separator: '\u2003',
            short: ['Rank', 'Name', 'XP', 'KDR', 'Win %'],
            long: ['Rank', 'Name', 'XP', 'Kills', 'Deaths', 'KDR', 'HS', 'Streak', 'Win %', 'Last Active']
        }
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

    convertToObj(a, b) {
        if(!a || !a.length || !b || !b.length || a.length != b.length){
            return null;
        }

        let obj = {};
        
        // Using the foreach method
        a.forEach((k, i) => {obj[k] = b[i]});
        return obj;
    }

    shortDescription() {
        const exp = this.exp.format(),
        kd = this.kdr,
        win_rate = this.rounds_won.value() / this.rounds_played.value(),
        wr = numeral(win_rate).format('0.00%');

        let obj = this.convertToObj(this.detailsHeaders.short, [this.rank, this.user, exp, kd, wr]);
        return obj;
    }

    longDescription() {
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

        let obj = this.convertToObj(this.detailsHeaders.long, [this.rank, this.user, exp, kills, deaths, kd, hs, streak, wr, last_active]);
        return obj;
    }
}

module.exports = Bot;
