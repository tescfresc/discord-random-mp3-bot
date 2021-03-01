var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var ytdl = require('ytdl-core');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

let voiceChannels;
let activeVoiceChannels = [];

let song = 'oldsong.mp3';
let link = "https://www.youtube.com/watch?v=zvq9r6R6QAY"
let activeChannelSearchInterval = 5; //the interval in minutes which it searches for active channels
let songMaxDelay = 30; //max delay in minutes before the song will play
let songMinDelay = 1;

let playing = false;
let waitingToPlay = false;


// Initialize Discord Bot
var bot = new Discord.Client();
bot.on('ready', function (evt) {
    logger.info('Logged in');
    voiceChannels = bot.channels.cache.filter(c => c.type === "voice");
    getActiveVoiceChannels();    
});
bot.on('message', msg => {
    if(msg.content.substring(0, 1) == '!') {
        let args = msg.content.substring(1).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            //milkersplz
            case 'forcesearch':
                getActiveVoiceChannels();
                break;
	        case 'forceplay':
                joinAndPlay();
                break;
            case 'setsong':
                link = args[0];
                console.log(link);
                break;

        }
    }
});
function getActiveVoiceChannels() {
    let newChannels = [];
    for(let [id, channel] of voiceChannels){
        if(channel.members.size > 0) {
            newChannels.push(channel);
        }
    }
    activeVoiceChannels = newChannels;
    if(activeVoiceChannels.length > 0 && !playing && !waitingToPlay) {
        let delay = Math.floor(Math.random() * songMaxDelay * 60 * 1000) + (songMinDelay * 60 * 1000);
        console.log("Active voice channel found, playing song in: " + delay + " milliseconds");
        setTimeout(joinAndPlay, delay);
        waitingToPlay = true;
    }
    setTimeout(getActiveVoiceChannels, activeChannelSearchInterval * 60 * 1000);
}
function joinAndPlay() {
    playing = true;
    waitingToPlay = false;
    let voiceChannel = activeVoiceChannels[Math.floor(Math.random() * activeVoiceChannels.length)];
    voiceChannel.join()
        .then(connection => {
            //connection.play(ytdl(link, {quality: 'highestaudio'}), {volume: 0.05})
            connection.play(song, {volume: 0.8})
                .on('finish', () => {
                   voiceChannel.leave();
                   playing = false;
                   console.log("song ended, leaving voice chat");
            });
            
        });
}
bot.login(auth.token);
