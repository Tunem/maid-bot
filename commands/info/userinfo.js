const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || 0x0099ff)
            .setTitle(`${user.username}'s Info`)
            .setThumbnail(user.displayAvatarURL({ extension: 'jpg' }))
            .addFields(
                // Discordin sisäinen käyttäjätunnus (pysyvä)
                { name: '🪪 User ID',      value: user.id,                                          inline: true },
                // Tilin luontipäivä Discordissa
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
                // Palvelimelle liittymispäivä
                { name: '📥 Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Unknown', inline: true },
                // Boostaa palvelinta?
                { name: '🚀 Boosting',      value: member?.premiumSince ? `Since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:D>` : 'No', inline: true },
                // Onko botti?
                { name: '🤖 Bot',           value: user.bot ? 'Yes' : 'No',                         inline: true },
                // Palvelinkohtaiset roolit
                { name: `🏷️ Roles (${member?.roles.cache.size - 1 || 0})`, value: roles },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};