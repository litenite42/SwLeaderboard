const { SlashCommandBuilder } = require('discord.js');

const path = require('path');
const website_const = require(path.resolve(__dirname, './constants/website.js'));

class SkillwarzCommandBuilder extends SlashCommandBuilder {
	constructor() {
		super();
		this.addIntegerOption(option =>
			option.setName('season')
				.setDescription('Specify which seasonal leaderboard to pull data from.')
				.setMinValue(website_const.min_season_nbr)
				.setMaxValue(website_const.max_season_nbr))
			.addIntegerOption(option =>
				option.setName('year')
					.setDescription('Specify which year to pull data for.')
					.setMinValue(website_const.min_year)
					.setMaxValue(website_const.max_year));
	}
}

module.exports = SkillwarzCommandBuilder;
