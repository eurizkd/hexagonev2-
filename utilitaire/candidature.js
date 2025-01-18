const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'candidature',
    description: 'Permet de soumettre une candidature.',
    async execute(client, message, args) {

        // Vérification des permissions (si nécessaire)
        if (!message.member.permissions.has("MANAGE_MESSAGES")) {
            return message.reply("Tu n'as pas la permission de soumettre une candidature.");
        }

        // Création du bouton de soumission de candidature
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('submit_candidature')
                    .setLabel('Soumettre une Candidature')
                    .setStyle('PRIMARY')
            );

        // Envoi du message avec le bouton
        await message.channel.send({
            content: "Cliquez sur le bouton ci-dessous pour soumettre votre candidature.",
            components: [row],
        });
    }
};

client.on('interaction', async (interaction) => {
    if (!interaction.isButton()) return;

    // Vérification si l'ID de l'interaction est celui du bouton de candidature
    if (interaction.customId === 'submit_candidature') {
        await interaction.reply("Merci de soumettre votre candidature en envoyant votre message.");
        
        // Attente du message de candidature
        const filter = m => m.author.id === interaction.user.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 300000, errors: ['time'] });

        if (collected.size === 0) {
            return interaction.followUp("Tu n'as pas envoyé de candidature dans le délai imparti.");
        }

        const candidatureMessage = collected.first();

        // Suppression du message de candidature dans le salon d'origine
        await candidatureMessage.delete();

        // ID du salon du serveur où envoyer la candidature
        const targetChannelID = 'ID_DU_SALON_DANS_AUTRE_SERVEUR';

        // Récupération du serveur cible
        const targetGuild = client.guilds.cache.get('ID_DU_AUTRE_SERVEUR');
        if (!targetGuild) {
            return interaction.followUp("Le serveur cible n'a pas pu être trouvé.");
        }

        // Récupération du salon où envoyer la candidature
        const targetChannel = targetGuild.channels.cache.get(targetChannelID);
        if (!targetChannel) {
            return interaction.followUp("Le salon cible n'a pas été trouvé.");
        }

        // Envoi du message de candidature dans le salon du serveur cible
        const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Nouvelle Candidature')
            .setDescription(candidatureMessage.content)
            .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
            .setTimestamp();

        await targetChannel.send({ embeds: [embed] });

        // Confirmation à l'utilisateur
        return interaction.followUp("Ta candidature a bien été soumise et envoyée.");
    }
});