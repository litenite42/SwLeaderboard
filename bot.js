const Discord = require('discord.js');
const columnify = require('columnify');

const invis_space = '\u200B';
const leaderboardUrl = 'https://skillwarz.com/modern/leaderboard##YEAR####SEASON##.php';

const path = require('path');
const website_const = require(path.resolve(__dirname, './constants/website.js'));

const axios = require('axios');

class Bot {

	constructor() {
		this.season_aliases = ['n', 'sn', 'season'];
		this.year_aliases = ['y', 'yr', 'year'];
		this.data = '';
		this.url = '';
	}

	async buildPlayerCard(url, title, name) {
		// get the name using the correct name number
		const result = await axios.post(url, {
			search : name,
		},
		{
			headers: {
				'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}).then(r => r.data);
		let response;
		if (result && result.length) {
			const data = this.getPlayersData(result);
			// necessary discord js require to get the EmbedMessage definition
			const responseEmbed = new Discord.EmbedBuilder();

			responseEmbed.setDescription(title);

			const player = new Player(data);

			const embed = player.PlayerCard(responseEmbed);

			response = embed;
		}

		return response;
	}

	async sendLeaderPage(query, data, page, short) {
		console.log('sendLeaderPage');
		if (data.length) {
			console.log('data had length');
			let players = [];
			let part = 1;
			let has_replied = false;
			for (let i = 0, j = 11; j < data.length + 11; i += 1, j += 11) {
				const player = new Player(data.slice(i * 11, j));
				let description = {};

				if (short) {
					description = player.shortDescription();
				}
				else {
					description = player.longDescription();
				}

				players.push(description);

				if (this.mod(players.length, 10) == 0) {
					const table = columnify(players,
						{
							columnSplitter: ' | ',
							align: 'right',
							headingTransform: function(heading) {
								return heading.toUpperCase();
							},
							config: {
								Name: {
									align: 'left',
								},
							},
						});

					const title = this.buildLeaderboardTitle(page, part++),
						message = `${title}\n\`\`\`${table}\`\`\``,
						response = { content: message };
					console.log(message);
					if (query.followUp)	 response.ephemeral = true;
					if (!query.followUp || !has_replied) {
						await query.reply(response);
						has_replied = true;
					}
					else {
						await query.followUp(response);
					}
					players = [];
				}
			}

			return;
		}
		query.channel.send('An error occurred. No Data was retrieved.');
	}
	isNum(x) {
		return !isNaN(x);
	}

	mod(n, m) {
		// taken from: https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm for explanation of negative modules in js
		return ((n % m) + m) % m;
	}

	isEmptyArray(arr) {
		return Array.isArray(arr) && !arr.length;
	}

	determineSeason(seasonNbr) {
		const OPTION = require('./option.js');

		const result = new OPTION();
		result.default = website_const.current_season.toString();

		if (this.isNum(seasonNbr)) {
			seasonNbr = +seasonNbr;
			if (seasonNbr >= website_const.min_season_nbr && seasonNbr <= website_const.max_season_nbr) {
				result.value = `${seasonNbr}`;
			}
			else {
				result.hasError = true;
				result.msg = `Season must be in the interval [${website_const.min_season_nbr},${website_const.max_season_nbr}].`;
			}
		}

		return result;
	}

	determineYear(yearNbr) {
		const OPTION = require('./option.js');

		const result = new OPTION();
		result.default = website_const.max_year.toString();

		if (this.isNum(yearNbr)) {
			yearNbr = +yearNbr;

			if (yearNbr >= website_const.min_year && yearNbr <= website_const.max_year) {
				result.value = yearNbr.toString();
			}
			else {
				result.hasError = true;
				result.msg = `Year must be in the interval [${website_const.min_year},${website_const.max_year}]`;
			}
		}

		return result;
	}

	getURLFromOptions(options) {
		const yearOption = options.getInteger('year'),
			seasonOption = options.getInteger('season');

		let yearText = '',
			seasonText = '';

		if (yearOption) {
			const yearResult = this.determineYear(yearOption);
			yearText = yearResult.value;
		}

		if (seasonOption) {
			const seasonResult = this.determineSeason(seasonOption);
			const season = seasonResult.getValueWithOffset();
			seasonText = season.value;
		}

		this.buildLeaderboardURL(yearText, seasonText);
	}

	getURLFromArgs(args) {
		let yearText = '',
			seasonText = '';

		for (let ndx = 0; ndx < args.length; ndx++) {
			const arg = args[ndx];

			if (!!arg && this.season_aliases.includes(arg)) {
				ndx++;
				const seasonNbr = args[ndx];

				const seasonResult = this.determineSeason(seasonNbr);
				const seasonValue = seasonResult.getValueWithOffset();

				if (seasonValue.offset) {
					ndx--;
				}

				seasonText = seasonValue.value;
			}
			else if (!!arg && this.year_aliases.includes(arg)) {
				ndx++;
				const yearNbr = args[ndx];

				const yearResult = this.determineYear(yearNbr);
				const year = yearResult.getValueWithOffset();

				if (year.offset) {
					ndx--;
				}

				yearText = year.value;
			}
		}

		this.buildLeaderboardURL(yearText, seasonText);
	}

	buildLeaderboardURL(yearText, seasonText) {
		let year = '',
			season = '';

		if (yearText) {
			year = `_${yearText}`;
		}
		else if (seasonText) {
			year = `_${website_const.max_year}`;
		}

		if (seasonText) {
			season = `_S${seasonText}`;
		}
		else if (yearText) {
			season = `_S${website_const.current_season}`;
		}

		const url = leaderboardUrl.replace('##YEAR##', year).replace('##SEASON##', season);
		this.url = url;
	}

	buildLeaderboardTitle(page, part) {
		const _url = this.url;
		let title = `**__Leaderboard ##SEASONAL##Page ${page} pt. ${part}__**\n<${this.convertToWebpageUrl(this.url)}>`;
		let season_replace = '';

		// extract season info from url to place in title
		if (_url.indexOf('_') !== -1) {
			const seasonal_info = _url.slice(_url.indexOf('_') + 1).split('_').map((el) => el.split('.')[0]);
			season_replace = seasonal_info.join(' ') + ' ';
		}

		title = title.replace('##SEASONAL##', season_replace);
		return title;
	}

	getPlayersData(result) {
		// node doesn't support dom natively, so import a dom parser
		const jsdom = require('jsdom');
		const {
			JSDOM,
		} = jsdom;

		const dom = new JSDOM(result);
		// create a virtual dom from the page
		const { document } = dom.window;
		// split url at first _ then append year and season
		const playerCells = document.querySelectorAll('tbody tr td');
		// get an array of all the data cells in the table
		return Array.prototype.slice.call(playerCells).map(f => f.textContent);
	}

	convertToWebpageUrl(url) {
		return url.replace('modern/', '');
	}

	seasonalOptionalParams() {
		const optionalParams = `[season_mod(${this.season_aliases.join(', ')}) season#] [year_mod(${this.year_aliases.join(', ')}) year#]`;

		return optionalParams;
	}

	seasonalLeaderboardHelp(commandName) {
		const helpText =
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


const numeral = require('numeral');
class Player {
	constructor(data) {
		this.detailsHeaders = {
			separator: '\u2003',
			short: ['Rank', 'Name', 'XP', 'KDR', 'Win %'],
			long: ['Rank', 'Name', 'XP', 'Kills', 'KDR', 'HS', 'Streak', 'Win %'],
		};
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

		this._abbrevFormat = '0.0 a';
	}

	PlayerCard(embed) {
		embed.addFields({ name: 'Name', value: this.user, inline: true },
			{ name: 'XP', value: this._formatMagnitude(this.exp), inline: true },
			{ name: invis_space, value: '**Kill Stats**', inline: false },
			{ name:'K/D', value: numeral(this.kdr).format('0.00'), inline: true },
			{ name:'Kills', value: this._formatMagnitude(this.kills), inline: true },
			{ name:'Headshots', value: this._formatMagnitude(this.headshots), inline: true },
			{ name:'Deaths', value: this._formatMagnitude(this.deaths), inline: true },
			{ name:invis_space, value: '**Round Stats**', inline: false },
			{ name:'Total', value: this._formatMagnitude(this.rounds_played), inline: true },
			{ name:'Won', value: this._formatMagnitude(this.rounds_won), inline: true },
			{ name:'Last Active', value: this.last_active, inline: true });

		return embed;
	}

	_formatMagnitude(numeralValue) {
		const _abbrevList = ['K', 'M', 'B', 'T'];

		let temp = numeralValue,
			abbrevIndex = -1,
			value = numeralValue;

		while ((temp /= 1000) > 1) {
			abbrevIndex++;
			value = temp;
		}

		const abbrev = abbrevIndex > -1 ? `${_abbrevList[abbrevIndex]}` : '';
		return numeral(value).format('0.0') + abbrev;
	}

	convertToObj(a, b) {
		if (!a || !a.length || !b || !b.length || a.length != b.length) {
			return null;
		}

		const obj = {};

		// Using the foreach method
		a.forEach((k, i) => {obj[k] = b[i];});
		return obj;
	}

	shortDescription() {
		const exp = this._formatMagnitude(this.exp),
			kd = this.kdr,
			win_rate = numeral(this.rounds_won).value() / numeral(this.rounds_played).value(),
			wr = numeral(win_rate).format('0.00%');

		return this.convertToObj(this.detailsHeaders.short, [this.rank, this.user, exp, kd, wr]);
	}

	longDescription() {
		const exp = this._formatMagnitude(this.exp),
			kd = this.kdr,
			win_rate = numeral(this.rounds_won).value() / numeral(this.rounds_played).value(),
			wr = numeral(win_rate).format('0.00%'),
			kills = this._formatMagnitude(this.kills),
			hs = this._formatMagnitude(this.headshots),
			streak = numeral(this.killstreak).value();

		return this.convertToObj(this.detailsHeaders.long, [this.rank, this.user, exp, kills, kd, hs, streak, wr]);
	}
}

module.exports = Bot;
