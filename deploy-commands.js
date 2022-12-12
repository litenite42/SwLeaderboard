const { REST, Routes } = require('discord.js');
const {
	prefix,
	silent,
	environment, clientId, guildId } = require('./config.json');
const fs = require('node:fs');

const DotEnv = require('dotenv');
let result = {};
if (!!environment && environment == 'production') {
	result = DotEnv.config();
}
else {
	result = DotEnv.config({
		path: 'dev.env',
	});
}

console.log(result.parsed);

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(result.parsed.AUTH_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		console.log(commands);
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
