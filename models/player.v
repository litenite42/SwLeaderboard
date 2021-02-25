module models

import strconv as conv

pub enum Verbosity {
	short
	medium
	long
}

pub struct Player {
pub:
	rank        int    = -1
	user        string = 'dummy-account'
	exp         int
	kills       int
	deaths      int
	kdr         f64
	headshots   int
	killstreak  int
	rnds_played int
	rnds_won    int
	last_actv   string = '0001-01-01'
}

pub struct PlayerConfig {
	data []string = []string{cap: 11}
}

pub fn new_player(p PlayerConfig) &Player {
	trank := conv.atoi(p.data[0]) or { -1 }
	texp := conv.atoi(p.data[2]) or { -1 }
	tkills := conv.atoi(p.data[3]) or { -1 }
	tdeaths := conv.atoi(p.data[4]) or { -1 }
	tkdr := conv.atof64(p.data[5])
	theadshots := conv.atoi(p.data[6]) or { -1 }
	tkillstreak := conv.atoi(p.data[7]) or { -1 }
	trnds_played := conv.atoi(p.data[8]) or { -1 }
	trnds_won := conv.atoi(p.data[9]) or { -1 }
	return &Player{
		rank: trank
		user: p.data[1]
		exp: texp
		kills: tkills
		deaths: tdeaths
		kdr: tkdr
		headshots: theadshots
		killstreak: tkillstreak
		rnds_played: trnds_played
		rnds_won: trnds_won
		last_actv: p.data[10]
	}
}

pub fn (p Player) short() []string {
	return ['${p.rank:3d}', '${p.user:15s}', p.last_actv]
}

pub fn (p Player) medium() []string {
	return ['${p.rank:3d}', '${p.user:15s}', '${p.rnds_won:8d}', '${p.rnds_played:8d}', '${p.kdr:02.2f}',
		p.last_actv,
	]
}

pub fn (p Player) to_str(v Verbosity) string {
	mut description := '#${p.rank:3d} ) ${p.user:15s}'

	description += match v {
		.short { ' ${p.exp:12d} ' }
		.medium { ' ${p.exp:12d} ${p.kdr:02.2f} ${p.rnds_won:12d}' }
		.long { ' ${p.exp:12d} ${p.kdr:02.2f} ${p.kills:8d} ${p.deaths:8d} ${p.rnds_played:8d} ${p.rnds_won:8d}' }
	}

	description += '  $p.last_actv'

	return description
}
