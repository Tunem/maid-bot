const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Sends a message as the bot.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send.')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message', true);

        // Poistetaan käyttäjän komento näkyvistä (ephemeral) ja lähetetään viesti kanavalle
        await interaction.reply({ content: 'Message sent!', ephemeral: true });
        await interaction.channel.send(message);
    },
};