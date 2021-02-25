module commands

pub interface Command {
	get_name() string
	get_aliases() []string
	get_description() string
	get_usage() string
	get_handler() ApiHandler
	set_handler(ApiHandler)
	get_str() string
}

pub struct BaseCommand {
mut:
	name        string = 'Dummy'
	aliases     []string
	description string
	usage       string
	handler     ApiHandler
}

pub fn add_to_map(mut m map[string]ApiHandler, p Command) {
	pg_name := p.get_name()
	pg_handler := p.get_handler()
	m['$pg_name'] = pg_handler
	for alias in p.get_aliases() {
		m['$alias'] = pg_handler
	}
}

pub type ApiInput = string

pub type ApiHandler = fn (ApiInput) []string
