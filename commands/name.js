const BOT = require('../bot.js');
const bot = new BOT();

const SkillwarzCommandBuilder = require('../SkillwarzCommandBuilder.js');

const _sendPlayerCard = async (interaction, url, name) => {
	const embed = await bot.buildPlayerCard(url, 'Player Card', name);
	let toSend;
	if (embed) {
		toSend =
		{
			embeds: [embed],
		};
	}
	else {
		toSend = 'An error occurred. No Data was retrieved.';
	}

	interaction.reply(toSend);
};

const _handleName = async (interaction, useOpts, name, args) => {
	if (!name || !name.length || name.length < 3) {
		return interaction.reply(`Entered Username (${name}) was invalid.\nRemember that username's are case-sensitive.`);
	}
	console.log(bot.url);
	if (useOpts) {
		bot.getURLFromOptions(args);
	}
	else {
		bot.getURLFromArgs(args);
	}

	await _sendPlayerCard(interaction, bot.url, name);
};

module.exports = {
	data: new SkillwarzCommandBuilder()
		.setName('card')
		.setDescription('Get the player card of a specific user.')
		.addStringOption(o => o.setName('name').setDescription('IGN of user in question. [Must be exact].')),
	name: 'card',
	description: 'Get description of specified player.',
	args: true,
	rate_limit: true,
	usage: '<user_name> ' + bot.seasonalOptionalParams(),
	aliases: ['n', 'nm'],
	extended_usage: '- Enter user_name of player in question\n- Search is case-sensitive, so: litenite and Litenite are not the same.\n' + bot.seasonalLeaderboardHelp('name'),
	async handleEvent(message, args) {
		const name = args.shift();
		await _handleName(message, false, name, args);
	},
	async execute(interaction) {
		const opts = interaction.options,
			name = opts.getString('name');
		await _handleName(interaction, true, name, opts);
	},
};
