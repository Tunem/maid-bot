const { Events } = require('discord.js');
const { buildProfileCard } = require('../utils/profileCard');
const { infoEmbed } = require('../utils/embed');

// Aseta tähän sen kanavan ID johon tervetuluviestit lähetetään
const WELCOME_CHANNEL_ID = 'CHANNEL_ID_HERE';

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

        if (!channel) {
            console.error(`[welcome] Could not find welcome channel with ID ${WELCOME_CHANNEL_ID}`);
            return;
        }

        try {
            const attachment = await buildProfileCard(
                member.displayName,
                member.user.displayAvatarURL({ extension: 'jpg' }),
            );

            // Rakennetaan tervetuluviesti utils/embed.js:n infoEmbed-pohjalla
            const embed = infoEmbed(
                `Welcome to ${member.guild.name}!`,
                `Hey <@${member.id}>, welcome to the server! 👋`,
            ).setImage('attachment://profile-image.png'); // Viittaa liitettyyn profiilikorttiin

            await channel.send({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('[welcome] Failed to send welcome message:', error);
        }
    },
};