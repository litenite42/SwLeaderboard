// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { RateLimiter } = require('discord.js-rate-limiter');

const fs = require('node:fs');
const path = require('node:path');

const DotEnv = require('dotenv');
DotEnv.config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const G = (x) => x * 1000;

const nbr_request = process.env.NBR_REQUESTS ?? 1,
	interval = process.env.INTERVAL ?? 4;

const rateLimiter = new RateLimiter(nbr_request, G(interval));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(rateLimiter, ...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(rateLimiter, ...args));
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	if (command.rate_limit) {
		const isLimited = rateLimiter.take(interaction.channelId);

		if (isLimited) {
			return interaction.reply(`**Error**: Exceeded the allowed number of recent requests. Current Rate-Limit: ${rateLimiter.amount} requests every ${rateLimiter.interval / 1000} seconds.`);
		}
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log in to Discord with your client's token
client.login(process.env.AUTH_TOKEN);
