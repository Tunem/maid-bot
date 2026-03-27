const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Closes the current support ticket.')
        // Vain adminit voivat sulkea tikettejä
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Tarkistetaan että komento ajetaan tikettikanavalla
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                embeds: [errorEmbed('Invalid Channel', 'This command can only be used in a ticket channel.')],
                ephemeral: true,
            });
        }

        // Pieni viive ennen sulkemista jotta käyttäjä ehtii lukea viestin
        await interaction.reply('🔒 Closing ticket in 5 seconds...');

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error(error);
            }
        }, 5000);
    },
};