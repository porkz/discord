const SQLite = require("better-sqlite3");
const sql = new SQLite("./muted.sqlite");

const { Client, Intents, Permissions } = require('discord.js');
const { token } = require('./config.json');
const bed = "900509228257660998"; // AFK voice channel id
const la = "900463544754143232"; // LA id

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });

client.once('ready', () => {
	console.log('Ready!');
	const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='muted';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE muted (member TEXT, guild TEXT, UNIQUE (member, guild) ON CONFLICT REPLACE);").run();
		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");
	}
	client.checkMute = sql.prepare("SELECT * FROM muted WHERE member = ? AND guild = ?");
  	client.setMute = sql.prepare("INSERT INTO muted (member, guild) VALUES (@member, @guild);");
  	client.delMute = sql.prepare("DELETE FROM muted WHERE member = ? AND guild = ?");
});

client.on('voiceStateUpdate', async (oldState, newState) => {
	if (!oldState.serverMute && newState.serverMute) {
		let muted = { member: `${newState.id}`, guild:`${newState.guild.id}` };
		client.setMute.run(muted);
	}
	else if (oldState.serverMute && !newState.serverMute) {
		client.delMute.run(newState.id, newState.guild.id);
	}
	else if (!oldState.channelId && newState.channelId &&
		client.checkMute.get(newState.id, newState.guild.id)) {
			await oldState.setMute(true).catch(e => console.error(e));
	}
	else if (newState.guild.id === la && newState.channelId != bed && newState.selfMute && newState.selfDeaf) {
		await newState.member.voice.setChannel(bed).catch(e => console.log(e));
	}
});
client.login(token);
