const SQLite = require("better-sqlite3");
const sql = new SQLite("./muted.sqlite");

const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

// TODO: check intents
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Ready!');

	const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='muted';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE muted (id TEXT PRIMARY KEY, user TEXT, guild TEXT, muted INTEGER);").run();
		sql.prepare("CREATE UNIQUE INDEX muted_id ON muted (id);").run();
		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");
	}
	client.checkMute = sql.prepare("SELECT * FROM muted WHERE id = ? AND guild = ?");
  	client.setMute = sql.prepare("INSERT INTO muted (id, user, guild, muted) VALUES (@id, @user, @guild, @points);");
  	client.delMute = sql.prepare("DELETE FROM muted WHERE id = ? AND guild = ?");
	
});

client.on('guildMemberAdd', async newMember => {
	 if(client.checkMute.get(newMember.id, newMember.guild.id)) {
		 //mute newMember.id
	 }
});

//on mute
// client.setMute.run(id, guild.id)

//on unmute
// client.delMute(id, guild.id)

client.login(token);
