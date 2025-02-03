const Discord = require("discord.js");
const db = require('quick.db');
const owner = new db.table("Owner");
const cl = new db.table("Color");
const config = require("../config");
const fs = require('fs');
const pgs = new db.table("PermGs");
const ml = new db.table("modlog");
const p3 = new db.table("Perm3");

module.exports = {
    name: 'nuke',
    usage: 'nuke',
    description: `Supprime tous les salons et expulse tous les membres.`,
    async execute(client, message, args) {

        let color = cl.fetch(`color_${message.guild.id}`);
        if (color == null) color = config.bot.couleur;
        const perm3 = p3.fetch(`perm3_${message.guild.id}`);

        if (owner.get(`owners.${message.author.id}`) || 
            message.member.roles.cache.has(perm3) || 
            config.bot.buyer.includes(message.author.id) || 
            message.member.roles.cache.has(pgs.get(`permgs_${message.guild.id}`))) {

            message.reply("**Le serveur est en train d'être reset...**");

            // Suppression de tous les salons
            message.guild.channels.cache.forEach(channel => {
                channel.delete().catch(err => console.log(`Erreur en supprimant ${channel.name}: ${err}`));
            });

            // Expulsion des membres (sauf le propriétaire)
            message.guild.members.cache.forEach(member => {
                if (member.id !== message.guild.ownerId && !owner.get(`owners.${member.id}`)) {
                    member.kick("Reset du serveur").catch(err => console.log(`Erreur en expulsant ${member.user.tag}: ${err}`));
                }
            });

            // Log de l'action
            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(`<@${message.author.id}> a lancé un \`reset\` du serveur.`)
                .setTimestamp()
                .setFooter({ text: `🔥 Reset effectué` });

            const logchannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
            if (logchannel) logchannel.send({ embeds: [embed] }).catch(() => false);
        } else {
            message.reply("Tu n'as pas la permission d'exécuter cette commande !");
        }
    }
};