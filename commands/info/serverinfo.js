const { SlashCommandBuilder } = require('discord.js');
const { infoEmbed } = require('../../utils/embed');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Provides information about the server.'),
    async execute(interaction) {
        const guild = interaction.guild;

        // Haetaan omistajan tiedot — fetchOwner() hakee jäsenen Discordin API:sta
        const owner = await guild.fetchOwner();

        // Lasketaan kanavat tyypin mukaan
        const textChannels  = guild.channels.cache.filter(c => c.type === 0).size;  // GUILD_TEXT
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;  // GUILD_VOICE

        // Poistetaan @everyone roolien laskusta
        const roleCount = guild.roles.cache.filter(r => r.name !== '@everyone').size;

        // Boost-tason kuvaus
        const boostTiers = {
            0: 'No boost',
            1: 'Tier 1',
            2: 'Tier 2',
            3: 'Tier 3',
        };

        const embed = infoEmbed(`${guild.name}`, 'Server information')
            .setThumbnail(guild.iconURL({ extension: 'png' }))
            .addFields(
                // Omistaja
                { name: '👑 Owner',           value: `<@${owner.id}>`,                                       inline: true },
                // Palvelimen luontipäivä
                { name: '📅 Created',          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,   inline: true },
                // Palvelimen ID
                { name: '🪪 Server ID',        value: guild.id,                                               inline: true },
                // Jäsenmäärä
                { name: '👥 Members',          value: `${guild.memberCount}`,                                 inline: true },
                // Kanavat eriteltynä
                { name: '💬 Text Channels',    value: `${textChannels}`,                                      inline: true },
                { name: '🔊 Voice Channels',   value: `${voiceChannels}`,                                     inline: true },
                // Roolien määrä
                { name: '🏷️ Roles',            value: `${roleCount}`,                                         inline: true },
                // Boostit
                { name: '🚀 Boosts',           value: `${guild.premiumSubscriptionCount} (${boostTiers[guild.premiumTier]})`, inline: true },
                // Verifiointitaso
                { name: '🔒 Verification',     value: `Level ${guild.verificationLevel}`,                     inline: true },
            );

        await interaction.reply({ embeds: [embed] });
    },
};