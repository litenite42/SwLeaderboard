module controllers

import net.http as hp
import net.html as hl
import math as m

const (
	PrimaryUrl = 'https://skillwarz.com/modern/leaderboard.php'
	MaxPageNbr = 10
	MinPageNbr = 1
)

pub struct Leaderboard {
mut:
	page_nbr int
}

// next move to the next page of the leaderboard if possible
pub fn (mut l Leaderboard) next() []string {
	check := l.page_nbr + 1
	if check > MaxPageNbr {
		return []
	}
	l.page_nbr++

	return l.page(l.page_nbr)
}

// prev move to the previous page of the leaderboard if possible
pub fn (mut l Leaderboard) prev() []string {
	check := l.page_nbr - 1
	if check < MinPageNbr {
		return []
	}

	l.page_nbr--
	return l.page(l.page_nbr)
}

// page move to the page number specified
pub fn (l Leaderboard) page(pg int) []string {
	pg_abs := int(m.abs(pg))

	if pg_abs < MinPageNbr || pg_abs > MaxPageNbr {
		return []
	}

	query := if pg < 0 { MaxPageNbr + 1 + pg } else { pg } // pg % (MaxPageNbr + 1)
	webpage := hp.get('$PrimaryUrl?page=$query') or { panic(err) }

	data := l.parse(webpage.str())
	return data
}

// name perform a search to get a specific user by name
pub fn (l Leaderboard) name(n string) []string {
	if n.len < 1 {
		return []
	}

	webpage := hp.post_form(PrimaryUrl, {
		'search': '$n'
	}) or { panic(err) }

	data := l.parse(webpage.str())
	return data
}

// parse the html from the table to retrieve the text information about the players
fn (l Leaderboard) parse(webpage string) []string {
	mut parser := hl.Parser{}
	parser.parse_html(webpage)

	mut dom := parser.get_dom()

	data := dom.get_tag('td').map(it.text())

	return data
}
