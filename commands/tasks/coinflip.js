const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin.'),
    async execute(interaction) {
        // Math.random() palauttaa 0–1, joten 50% todennäköisyys kummallekin puolelle
        const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
        await interaction.reply(result);
    },
};