module commands

pub struct Name {
mut:
	base BaseCommand = BaseCommand{
		name: 'name'
		aliases: ['nm', 'n']
		description: 'returns the information of specified user. Note: Is case-sensitive'
		usage: '<user_name>'
	}
}

pub fn new_name(h ApiHandler) &Name {
	mut n := &Name{}
	n.set_handler(h)

	return n
}

fn (p Name) get_name() string {
	return p.base.name
}

fn (p Name) get_aliases() []string {
	return p.base.aliases
}

fn (p Name) get_description() string {
	return p.base.description
}

fn (p Name) get_usage() string {
	return p.base.usage
}

fn (p Name) get_handler() ApiHandler {
	return p.base.handler
}

pub fn (mut p Name) set_handler(h ApiHandler) {
	p.base.handler = h
}

fn (p Name) get_str() string {
	aliases := p.get_aliases().join(',')
	return '$p.get_name(): $p.get_description()  $p.get_usage()  aliases: $aliases'
}
