const Discord = require('discord.js');
const client = new Discord.Client();
const token = '<token>';
const la = '278706666176774144';
let t = [];
let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

client.login(token);

client.on('ready', () => {
io.on("connection", socket => {
  let channel = client.channels.cache.get(la);
  let members = channel.members;
  t = [];
  members.forEach(function(e) {
    let i = {
      name: e.user.username,
      avatar: e.user.avatarURL(),
      serverDeaf: e.voice.serverDeaf,
      serverMute: e.voice.serverMute,
      selfDeaf: e.voice.selfDeaf,
      selfMute: e.voice.selfMute,
      selfVideo: e.voice.selfVideo,
      streaming: e.voice.streaming,
    }
    t.push(i); 
    });
    t.sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}));
    io.sockets.emit('userlist', t);
});

  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  let channel = client.channels.cache.get(la);
  let members = channel.members;
  t = [];
  members.forEach(function(e) {
    let i = {
      name: e.user.username,
      avatar: e.user.avatarURL(),
      serverDeaf: e.voice.serverDeaf,
      serverMute: e.voice.serverMute,
      selfDeaf: e.voice.selfDeaf,
      selfMute: e.voice.selfMute,
      selfVideo: e.voice.selfVideo,
      streaming: e.voice.streaming,
    }
    t.push(i);
    });
    t.sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}));
    io.sockets.emit('userlist', t);

  });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));

/*
io.on('connection', (socket) => {
  io.sockets.emit('userlist', t);
});
*/
http.listen(3030, () => {
  console.log('listening on *:3030');
});

