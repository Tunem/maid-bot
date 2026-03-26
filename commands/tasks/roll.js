const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a dice.')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the dice (default: 6).')
                .setMinValue(2)
                .setMaxValue(1000)
                .setRequired(false)),
    async execute(interaction) {
        // Käytetään oletuksena d6 jos käyttäjä ei anna arvoa
        const sides = interaction.options.getInteger('sides') ?? 6;

        // Math.floor(Math.random() * sides) antaa 0–(sides-1), +1 siirtää välille 1–sides
        const result = Math.floor(Math.random() * sides) + 1;

        await interaction.reply(`🎲 You rolled a **${result}** (d${sides})`);
    },
};