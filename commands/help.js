const { prefix } = require('../config.json');
const { admin } = require('../roles.json');

function initHelpMsg(data, message, commands) {
    data.push('Here\'s a list of all my commands:');
    data.push(commands.filter(command => !command.role || command.role != 'admin' ).map(command => `*${command.name}*`).join(', '));
                
    let admin_check = message.member.roles.cache.some(r=>admin.includes(r.name));

    if (!!message.member && admin_check)
    {
        data.push('**Admin Commands**:  ');
        data.push(commands.filter(command => !!command.role || command.role == 'admin' ).map(command => `*${command.name}*`).join(', '));
    }
            
    data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
    
    return message.author.send(data, { split: true })
        .then(() => {
            if (message.channel.type === 'dm') return;
            message.reply('I\'ve sent you a DM with all my commands!');
        })
        .catch(error => {
            console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
        });
}
module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;
        const verbosity_tags = ['s', 'st','short'];
        if (!args.length) {
            return initHelpMsg(data, message, commands);
        }

        const name = args[0].toLowerCase();
    
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
        
        let verbose = !args[1] ||  !(verbosity_tags.indexOf(args[1])+1);

        if (verbose) {
            data.push('\n- Use s, st, or short for smaller messages');
        }

        if (!command) {
            return initHelpMsg([], message, commands);
        }
        
        data.push(`**${command.name}** - *${command.description}*\n\`${prefix}${command.name}\` ${command.usage ? command.usage : ''}`);
        
        if (verbose) {
            if (command.extended_usage) {
                data.push( command.extended_usage);
            }
            if (command.aliases) {
                data.push(`*Aliases*: ${command.aliases.join(', ')}`);
            }
        }

        data.push(`**Cooldown:** ${command.cooldown || 0} second(s)`);

        message.channel.send(data, { split: true });
    },
};