const date = new Date();
const Website = {
	min_season_nbr : 1,
	max_season_nbr : 4,
	min_page_nbr : 1,
	max_page_nbr: 10,
	min_year : 2021,
	date : date,
	max_year : date.getFullYear(),
	current_season : Math.floor(date.getMonth() / 3) + 1,
};

module.exports = Website;
