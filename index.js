const fs = require('fs');
const Discord = require('discord.js');
// file containing config info
const {prefix, silent, environment} = require(`./config.json`);
let result = require('dotenv');

if (!!environment && environment == 'production') {
   result = result.config();
}
else {
   result = result.config({path : 'dev.env'});
}
console.log(environment)
const version = process.env.npm_package_version

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

client.once('ready', () => {
   client.channels.cache.forEach((channel) => {
      if (channel.type === 'text' && channel.name == 'leaderboard' && silent !== 0)
      {
         channel.send(`Hello from <@${client.user.id}>!\nEnter ${prefix}help for assistance.`);
      }
   });
});

client.on('message', async (receivedMessage) => {
   // It's good practice to ignore other bots. This also makes your bot ignore itself
   // and not get into a spam loop (we call that "botception").
    if(!receivedMessage.content.slice(0, prefix.length).toLowerCase().startsWith(prefix) || receivedMessage.author.bot) return;
    
    const args = receivedMessage.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
   
    if (!command) return;

    if (command.args && !args.length) {
        return receivedMessage.channel.send(`You didn't provide any arguments, ${receivedMessage.author}!`);
    }

    try {
       await command.execute(receivedMessage, args);
    } catch (error) {
        receivedMessage.reply('there was an error trying to execute that command!');
    }
});

client.login(process.env.AUTH_TOKEN); // this assumes you followed the step in the README about a .env file. If you haven't, rename .env.sample and replace the appropriate text with your bot's token.