const Discord = require('discord.js');

module.exports = {
  name: 'dechiffrer',
  usage: 'dechiffrer <texte_chiffré>',
  description: `Déchiffre un message chiffré en Base64`,
  async execute(client, message, args) {
    const allowedRole = "1378799598285488290";

    // Vérifie si l'utilisateur a le rôle autorisé
    if (!message.member.roles.cache.has(allowedRole)) {
      return message.reply("🚫 Tu n'as pas l'autorisation de déchiffrer les messages.");
    }

    if (!args[0]) return message.reply("Tu dois entrer un message à déchiffrer.");

    try {
      const texte_chiffre = args.join(" ");
      const decoded = Buffer.from(texte_chiffre, 'base64').toString('utf-8');

      const embed = new Discord.MessageEmbed()
        .setTitle("🔓 Message déchiffré")
        .setDescription(`\`\`\`${decoded}\`\`\``)
        .setFooter({ text: "DGSI • Déchiffrement Base64" })
        .setColor("#2f3136");

      message.reply({ embeds: [embed] });

    } catch (err) {
      message.reply("❌ Le message ne semble pas être valide ou bien chiffré.");
    }
  }
}