const Discord = require("discord.js");
const db = require('quick.db');
const owner = new db.table("Owner");
const cl = new db.table("Color");
const config = require("../config");
const pgs = new db.table("PermGs");
const ml = new db.table("modlog");
const moment = require('moment');

module.exports = {
    name: 'compte',
    description: 'Gère la création, la connexion et la suppression de comptes.',
    usage: 'compte <action> <utilisateur>',
    async execute(client, message, args) {
        let color = cl.fetch(`color_${message.guild.id}`);
        if (!color) color = config.bot.couleur;

        // Vérification des permissions (Admins et propriétaires)
        const perm3 = pgs.fetch(`perm3_${message.guild.id}`);

        if (owner.get(`owners.${message.author.id}`) || message.member.roles.cache.has(perm3)) {

            // Action à réaliser : Créer, Connaitre ou Supprimer un compte
            const action = args[0]?.toLowerCase();
            const username = args[1];
            const password = args[2];

            // Création d'un compte
            if (action === 'creer' && username && password) {
                if (db.has(`compte_${username}`)) {
                    return message.reply(`Un compte avec ce nom d'utilisateur existe déjà.`);
                }

                // Sauvegarde des informations du compte
                db.set(`compte_${username}`, { password: password, createdAt: moment().format('YYYY-MM-DD HH:mm:ss') });

                // Logs de l'action
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`<@${message.author.id}> a créé un compte pour ${username}.`)
                    .setTimestamp()
                    .setFooter({ text: '📚' });

                const logChannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }

                return message.reply(`${username} a été créé avec succès.`);

            }

            // Connexion à un compte
            if (action === 'connecter' && username && password) {
                const compte = db.get(`compte_${username}`);
                
                if (!compte) {
                    return message.reply(`Aucun compte trouvé pour cet utilisateur.`);
                }

                // Vérification du mot de passe
                if (compte.password !== password) {
                    return message.reply(`Mot de passe incorrect pour ${username}.`);
                }

                // Logs de connexion
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`<@${message.author.id}> s'est connecté à son compte ${username}.`)
                    .setTimestamp()
                    .setFooter({ text: '📚' });

                const logChannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }

                return message.reply(`Connexion réussie pour ${username}.`);

            }

            // Suppression d'un compte
            if (action === 'supprimer' && username) {
                const compte = db.get(`compte_${username}`);
                
                if (!compte) {
                    return message.reply(`Aucun compte trouvé pour cet utilisateur.`);
                }

                // Suppression du compte
                db.delete(`compte_${username}`);

                // Logs de la suppression
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`<@${message.author.id}> a supprimé le compte ${username}.`)
                    .setTimestamp()
                    .setFooter({ text: '📚' });

                const logChannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }

                return message.reply(`Le compte de ${username} a été supprimé.`);

            }

            // Si l'action est invalide
            return message.reply("Action invalide. Utilisez `creer`, `connecter` ou `supprimer`.");

        } else {
            return message.reply("Vous n'avez pas les permissions nécessaires pour gérer les comptes.");
        }
    }
};