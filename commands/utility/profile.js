const { SlashCommandBuilder } = require('discord.js');
const { buildProfileCard } = require('../../utils/profileCard');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Displays your profile card.'),
    async execute(interaction) {
        // Rakennetaan profiilikortti jaetun apumoduulin avulla
        const attachment = await buildProfileCard(
            interaction.member.displayName,
            interaction.user.displayAvatarURL({ extension: 'jpg' }),
        );

        await interaction.reply({ files: [attachment] });
    },
};