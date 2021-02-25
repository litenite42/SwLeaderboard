import discordv as vd
import zztkm.vdotenv as denv
import os
import time
import strings as s
import strconv as scon
import models as m
import controllers as ctrl
import commands as cmd

const (
	bot             = init()
	NbrPlayerFields = 11
)

fn execute(h cmd.ApiHandler, i cmd.ApiInput) []string {
	return h(i)
}

struct Bot {
mut:
	prefix   string
	token    string
	ldrboard ctrl.Leaderboard = &ctrl.Leaderboard{}
	handlers map[string]cmd.ApiHandler
	commands []cmd.Command
}

fn init() &Bot {
	$if debug ? {
		denv.load('dev.env')
	} $else {
		denv.load()
	}
	mut pg := cmd.new_page(page)
	mut name_cmd := cmd.new_name(name)

	mut bot_commands := map[string]cmd.ApiHandler{}

	cmd.add_to_map(mut bot_commands, pg)
	cmd.add_to_map(mut bot_commands, name_cmd)

	mut commands := []cmd.Command{}
	commands << pg
	commands << name_cmd

	return &Bot{
		prefix: os.getenv('CMD_PREFIX')
		token: os.getenv('BOT_TOKEN')
		handlers: bot_commands
		commands: commands
	}
}

fn page(a string) []string {
	page_nbr := scon.atoi(a) or { 1 }
	return bot.ldrboard.page(page_nbr)
}

fn name(a string) []string {
	return bot.ldrboard.name(a)
}

fn main() {
	mut client := vd.new(token: bot.token) ?

	client.on_message_create(on_message_create)
	client.open() ?
}

fn on_message_create(mut client vd.Client, evt &vd.MessageCreate) {
	if !evt.content.starts_with(bot.prefix) || evt.author.bot {
		return
	}
	args := evt.content[(bot.prefix.len + 1)..].split(' ') // + 1 to capture the space
	mut players := []m.Player{}
	command := args[0].to_lower()
	values := args[1..]
	mut results := []string{}

	if command in ['help', 'hp', 'h'] {
		for c in bot.commands {
			help := c.get_str()
			println(help)
			client.channel_message_send(evt.channel_id, content: help.str()) or { }
		}
		client.channel_message_send(evt.channel_id, content: 'help: aliases: hp, h') or {}
	} else if command in bot.handlers {
		handler := bot.handlers[command]
		results = execute(handler, values[0])

		mut j := NbrPlayerFields
		mut length := results.len + NbrPlayerFields

		for i := 0; j < length; i += NbrPlayerFields {
			p := m.new_player(data: results[i..j])

			players << p
			j += NbrPlayerFields
		}
		mut out_text := '```'
		mut builder := s.new_builder(100)
		for player in players {
			temp := player.medium().join('\\u2003|\\u2003')
			x := temp + '\\n'
			builder.write(x.bytes()) or {}
		}
		new_temp := builder.str()

		out_text += new_temp
		out_text += '```'
		client.channel_message_send(evt.channel_id, content: out_text) or {}
	}
}
