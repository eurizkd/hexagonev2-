const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const activeConnections = new Map();

module.exports = {
  name: 'joinyt',
  description: 'Rejoint ton vocal et joue une URL YouTube en boucle (discord.js v13)',
  async execute(client, message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Tu dois être dans un canal vocal.");

    if (!args[0]) return message.reply("Donne-moi une URL YouTube à jouer.");

    if (!ytdl.validateURL(args[0])) return message.reply("URL YouTube invalide.");

    const guildId = message.guild.id;

    let connection = getVoiceConnection(guildId);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });
    }

    let player = activeConnections.get(guildId)?.player;
    if (!player) {
      player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });
      activeConnections.set(guildId, { connection, player });
    }

    const play = () => {
      const stream = ytdl(args[0], {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
      });
      const resource = createAudioResource(stream);
      player.play(resource);
    };

    play();

    player.on(AudioPlayerStatus.Idle, () => {
      play();
    });

    player.on('error', error => {
      console.error(error);
      message.channel.send("Une erreur est survenue lors de la lecture.");
      play();
    });

    connection.subscribe(player);

    message.reply(`🔊 Je reste connecté sur ${voiceChannel.name} et joue ta musique en boucle 24/7 !`);
  }
};