const { Client } = require('discord.js');
const { token, guildId, targetChanId, vanityChanId } = require('./config.json');

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_VOICE_STATES"
    ]
});

client.once('ready', () => {
    console.log(`Bot ready`);
});

client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
    const targetChannel = client.guilds.cache.get(guildId).channels.cache.get(targetChanId);
    const userCount = targetChannel.members.size;
    // over 24 users in voice chan
    if (userCount > 24) {
        // if user set cam on 
        if (!!newVoiceState.selfVideo) {
            // user moved to vanityChannel to meditate about vanity
            newVoiceState.member.voice.setChannel(vanityChanId)
                && newVoiceState.member.send("no cam over 24 users, now meditate about vanity ...");
        }
    }
});

client.login(token);
