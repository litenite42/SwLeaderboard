module commands

pub struct Page {
mut:
	base BaseCommand = BaseCommand{
		name: 'page'
		aliases: ['pg', 'p']
		description: 'returns the list of players on specified page'
		usage: '<page_nbr>'
	}
}

pub fn new_page(h ApiHandler) &Page {
	mut p := &Page{}
	p.set_handler(h)

	return p
}

fn (p Page) get_name() string {
	return p.base.name
}

fn (p Page) get_aliases() []string {
	return p.base.aliases
}

fn (p Page) get_description() string {
	return p.base.description
}

fn (p Page) get_usage() string {
	return p.base.usage
}

fn (p Page) get_handler() ApiHandler {
	return p.base.handler
}

fn (mut p Page) set_handler(h ApiHandler) {
	p.base.handler = h
}

fn (p Page) get_str() string {
	aliases := p.get_aliases().join(',')
	return '$p.get_name(): $p.get_description()  $p.get_usage()  aliases: $aliases'
}
