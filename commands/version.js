module.exports = {
    name: 'version',
    description: 'Return information about this bot',
    args: false,
    usage: '',
    aliases: ['v', 'vrsn'],
    async execute(message, args) {
        let version = process.env.npm_package_version;
        let homepage = process.env.npm_package_homepage;
        let authors = process.env.npm_package_author_name;

        let Discord = require('discord.js');
        let Embed = new Discord.MessageEmbed();
        Embed.addField('Version', version);
        Embed.addField('Author(s)', authors);

        Embed.setURL(homepage);
        Embed.setTimestamp();

        message.channel.send({
            embed: Embed
        });
    },
};
