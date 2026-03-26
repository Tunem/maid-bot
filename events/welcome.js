const { Events, EmbedBuilder } = require('discord.js');
const { buildProfileCard } = require('../utils/profileCard');

// Aseta tähän sen kanavan ID johon tervetuluviestit lähetetään
// Löydät ID:n Discordissa: Asetukset -> Edistynyt -> Kehittäjätila päälle,
// sitten oikeaklikkaa kanavaa ja valitse "Copy ID"
const WELCOME_CHANNEL_ID = '826514439951351869';

module.exports = {
    name: Events.GuildMemberAdd, // Laukeaa kun uusi jäsen liittyy palvelimelle
    async execute(member) {
        // Haetaan tervetuluviestin kanava ID:n perusteella
        const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

        if (!channel) {
            console.error(`[welcome] Could not find welcome channel with ID ${WELCOME_CHANNEL_ID}`);
            return;
        }

        try {
            // Rakennetaan profiilikortti samalla apumoduulilla kuin /profile-komento
            const attachment = await buildProfileCard(
                member.displayName,
                member.user.displayAvatarURL({ extension: 'jpg' }),
            );

            // Lähetetään tervetuluviesti embedinä profiilikortin kera
            const embed = new EmbedBuilder()
                .setColor(0x00cc99)
                .setTitle(`Welcome to ${member.guild.name}!`)
                .setDescription(`Hey <@${member.id}>, welcome to the server! 👋`)
                .setImage('attachment://profile-image.png') // Viittaa liitettyyn profiilikorttiin
                .setTimestamp();

            await channel.send({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('[welcome] Failed to send welcome message:', error);
        }
    },
};