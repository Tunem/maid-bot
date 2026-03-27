const { SlashCommandBuilder } = require('discord.js');
const { buildEmbed, COLORS } = require('../../utils/embed');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll with up to 4 options.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('First option.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Second option.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Third option.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Fourth option.')
                .setRequired(false)),
    async execute(interaction) {
        const question = interaction.options.getString('question', true);

        // Kerätään annetut vaihtoehdot — suodatetaan pois tyhjät (option3 ja option4 valinnaisia)
        const options = [
            interaction.options.getString('option1'),
            interaction.options.getString('option2'),
            interaction.options.getString('option3'),
            interaction.options.getString('option4'),
        ].filter(Boolean);

        // Emojit äänestysreaktioita varten, yksi per vaihtoehto
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

        // Rakennetaan embed buildEmbed()-funktiolla
        const embed = buildEmbed({
            title: '📊 ' + question,
            description: options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n'),
            color: COLORS.info,
            footer: `Poll by ${interaction.user.username}`,
            timestamp: true,
        });

        // Lähetetään äänestys ja lisätään reaktioemojit automaattisesti
        const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(emojis[i]);
        }
    },
};