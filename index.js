const fs = require('fs');
const Discord = require('discord.js');

const path = require('path');
// file containing authorication info
const auth = require(`./auth.json`);

// file containing config info
const {prefix, silent} = require(`./config.json`);

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
    console.log(prefix)
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
    if(!receivedMessage.content.startsWith(prefix) || receivedMessage.author.bot) return;
    
    const args = receivedMessage.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName == 'help') {
      let list = '';
      
      for (let command of client.commands) {
         command = command[1];
         
         let listing = `${prefix}${command.name} `;
         if (!!command.usage) {
            listing += command.usage;
         }
         list += listing + '\n';
      }
      
      return receivedMessage.channel.send(list);
    }
    
    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    if (command.args && !args.length) {
        return receivedMessage.channel.send(`You didn't provide any arguments, ${receivedMessage.author}!`);
    }

    try {
       await command.execute(receivedMessage, args);
    } catch (error) {
        console.error(error);
        receivedMessage.reply('there was an error trying to execute that command!');
    }
});

client.login(auth.token); // Replace XXXXX with your bot token