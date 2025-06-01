const Discord = require('discord.js');

module.exports = {
  name: 'chiffrer',
  usage: 'chiffrer <message>',
  description: `Chiffre un message (Base64)`,
  async execute(client, message, args) {
    const allowedRole = "1378799598285488290";

    // Vérifie si l'utilisateur a le rôle autorisé
    if (!message.member.roles.cache.has(allowedRole)) {
      return message.reply("🚫 Tu n'as pas l'autorisation d'utiliser cette commande.");
    }

    if (!args[0]) return message.reply("Tu dois entrer un message à chiffrer.");

    const texte = args.join(" ");
    const base64 = Buffer.from(texte).toString('base64');

    const embed = new Discord.MessageEmbed()
      .setTitle("🔐 Message chiffré")
      .setDescription(`\`\`\`${base64}\`\`\``)
      .setFooter({ text: "DGSI • Chiffrement Base64" })
      .setColor("#2f3136");

    message.reply({ embeds: [embed] });
  }
}