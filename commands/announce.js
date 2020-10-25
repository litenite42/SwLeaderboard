module.exports = {
    name: 'announce',
	description: 'Broadcast a message through the bot.',
	aliases: ['a', 'shout'],
    usage: '"Message Text Here"',
    extended_usage: '*Note*: The Double Quotes are recommended.',
    cooldown: 5,
    role: 'admin',
	execute(message, args) {
        const Discord = require('discord.js');
        const client = new Discord.Client();

        let announcement = '';
        let flag = '';

        if (args[args.length-1].endsWith('"')) {
            announcement = args.slice(0, args.length - 1);
            flag = args.slice(args.length-1)[0];
        }
        else {
            
            announcement = args
        }
            
        if (!!flag) {
            /* Plans to add:
                - all (a) - broadcast to all servers
                - force (f) - force w/o confirmation
            */
        }

            announcement = announcement.join(' ');

            // client.channels.cache.forEach((channel) => {
            //     if (channel.type === 'text' && channel.name == 'leaderboard' && silent !== 0)
            //     {
                // 
                   message.channel.send(`>>> From <@${message.author.id}>,\n${announcement}`);
            //     }
            //  });
    }
};