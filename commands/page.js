const BOT = require('../bot.js');
const bot = new BOT();

const SkillwarzCommandBuilder = require('../SkillwarzCommandBuilder.js');

const path = require('path');
const website_const = require(path.resolve(__dirname, '../constants/website.js'));

const seasonalHelpText = bot.seasonalLeaderboardHelp('page');
const short_length_aliases = ['s', 'st', 'short'];

const axios = require('axios');

const _description = 'Get a page of players from the specified leaderboard. Uses the all-time board by default.';

const _checkPageNumber = (page) => {
	const page_number_msg = 'Currently, only pages 1-10 [and their negatives] are available!';
	let result = '';
	console.log(page_number_msg);
	if (!page && !Number.isNaN(page)) {

		result += this.usage + '\nYou did not enter a page number! ' + page_number_msg;
	}

	const page_abs = Math.abs(page);
	if (page_abs < 1 || page_abs > 10) {
		result += this.usage + '\nIncorrect page number entered! ' + page_number_msg;
	}
	console.log('hello');
	console.log(result);
	return result.length > 0 ? page_number_msg + result : '';
};

const _getPageNumber = (page) => {
	return bot.mod(page, 11);
};

const _getPageData = async (interaction, url, page, short) => {
	const result = await axios.get(`${url}?page=${page}`).then(r => r.data);
	const data = bot.getPlayersData(result);

	await bot.sendLeaderPage(interaction, data, page, short);
};

module.exports = {
	data: new SkillwarzCommandBuilder()
		.setName('page')
		.setDescription(_description)
		.addIntegerOption(o =>
			o.setName('number')
				.setDescription('Page number')
				.setMinValue(website_const.min_page_nbr)
				.setMaxValue(website_const.max_page_nbr),
		)
		.addBooleanOption(o =>
			o.setName('short')
				.setDescription('Use short text')),
	name: 'page',
	description: _description,
	args: true,
	usage: '<page_nbr> [length_mod(' + short_length_aliases.join() + ')] ' + bot.seasonalOptionalParams(),
	short_aliases: short_length_aliases,
	year_aliases: bot.year_aliases,
	season_aliases: bot.season_aliases,
	rate_limit: true,
	aliases: ['p', 'pg'],
	extended_usage: '- page_nbr [negative indices welcome] is required, while length_mod defaults to long.\n' + seasonalHelpText,
	async handleEvent(message, args) {
		const pageNumber = args[0] ?? 1;

		const pageNumberCheck = _checkPageNumber(pageNumber);

		if (pageNumberCheck) {
			return message.reply(pageNumberCheck);
		}

		const page = _getPageNumber(pageNumber);
		// gets the index of which alias for short descriptions is matched by the argument
		const shortNdx = this.short_aliases.map((a) => args.indexOf(a)).filter((a) => a !== -1);

		const short = !bot.isEmptyArray(shortNdx);
		// remove the match to prevent reprocessing it for nothing
		if (short) {
			args.splice(shortNdx[0], 1);
		}

		bot.getURLFromArgs(args);
		await _getPageData(message, bot.url, page, short);
	},
	async execute(interaction) {
		const opts = interaction.options,
			pageNumber = opts.getInteger('number') ?? 1,
			short = opts.getBoolean('short') ?? false;

		const pageNumberCheck = _checkPageNumber(pageNumber);

		if (pageNumberCheck) {
			return interaction.reply(pageNumberCheck);
		}

		const page = _getPageNumber(pageNumber);

		bot.getURLFromOptions(opts);

		await _getPageData(interaction, bot.url, page, short);
	},
};
