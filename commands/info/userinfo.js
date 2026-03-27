const { SlashCommandBuilder } = require('discord.js');
const { buildEmbed, COLORS } = require('../../utils/embed');
const { buildProfileCard } = require('../../utils/profileCard');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows detailed information about a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to look up (defaults to yourself).')
                .setRequired(false)),
    async execute(interaction) {
        // Jos käyttäjää ei annettu parametrina, käytetään komennon suorittajaa
        const user   = interaction.options.getUser('user') ?? interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        // Järjestetään roolit hierarkian mukaan ja poistetaan @everyone
        const roles = member?.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(', ') || 'None';

        // Rakennetaan profiilikortti canvasilla
        const attachment = await buildProfileCard(
            member?.displayName ?? user.username,
            user.displayAvatarURL({ extension: 'jpg' }),
        );

        // Rakennetaan infoembed buildEmbed()-funktiolla
        // Profiilikortti näytetään embedin isona kuvana
        const embed = buildEmbed({
            title: `${user.username}'s Info`,
            color: member?.displayHexColor ? parseInt(member.displayHexColor.replace('#', ''), 16) : COLORS.info,
            image: 'attachment://profile-image.png', // Viittaa liitettyyn profiilikorttiin
            timestamp: true,
            fields: [
                { name: '🪪 User ID',        value: user.id,                                                                                              inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,                                                 inline: true },
                { name: '📥 Joined Server',   value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Unknown',                           inline: true },
                { name: '🚀 Boosting',        value: member?.premiumSince ? `Since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:D>` : 'No',      inline: true },
                { name: '🤖 Bot',             value: user.bot ? 'Yes' : 'No',                                                                             inline: true },
                { name: `🏷️ Roles (${member?.roles.cache.size - 1 || 0})`, value: roles },
            ],
        });

        await interaction.reply({ embeds: [embed], files: [attachment] });
    },
};