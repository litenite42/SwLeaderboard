const { Events } = require('discord.js');

const {
	prefix,
} = require('../config.json');

module.exports = {
	name: Events.MessageCreate,
	async execute(rateLimiter, receivedMessage) {
		if (!receivedMessage.content.slice(0, prefix.length)
			.toLowerCase()
			.startsWith(prefix) ||
		receivedMessage.author.bot) {
			return;
		}

		const isLimited = rateLimiter.take(receivedMessage.channelId);

		if (isLimited) {
			return receivedMessage.reply(`**Error**: Exceeded the allowed number of recent requests. Current Rate-Limit: ${rateLimiter.amount} requests every ${rateLimiter.interval / 1000} seconds.`);
		}

		const client = receivedMessage.client;
		// split input on spaces and then pop the bot's prefix off.
		const args = receivedMessage.content.slice(prefix.length).trim().split(/ +/);
		// console.log(args);
		const commandName = args.shift().toLowerCase();
		// determine if one of the bot's commands (or aliases) were entered
		const command = client.commands.get(commandName) ||
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		const some_error = false;
		if (!command) {return;}

		if ((command.args && !args.length) || some_error) {
			return receivedMessage.reply(`You didn't provide any arguments, ${receivedMessage.author}!`);
		}

		try {
			await command.handleEvent(receivedMessage, args);
		}
		catch (error) {
			return receivedMessage.reply('There was an error trying to execute that command!');
		}
	},
};
