const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { announceEmbed, COLORS } = require('../../utils/embed');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Sends a formatted announcement embed to a channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Announcement title.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Announcement message.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the announcement to.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Embed color (default: orange).')
                .setRequired(false)
                .addChoices(
                    { name: 'Blue',   value: 'blue' },
                    { name: 'Green',  value: 'green' },
                    { name: 'Red',    value: 'red' },
                    { name: 'Yellow', value: 'yellow' },
                    { name: 'Orange', value: 'orange' },
                    { name: 'Purple', value: 'purple' },
                ))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL to attach to the announcement.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('ping')
                .setDescription('Ping everyone or here with the announcement.')
                .setRequired(false)
                .addChoices(
                    { name: '@everyone', value: '@everyone' },
                    { name: '@here',     value: '@here' },
                )),
    async execute(interaction) {
        const title   = interaction.options.getString('title', true);
        const message = interaction.options.getString('message', true);
        const channel = interaction.options.getChannel('channel', true);
        const color   = interaction.options.getString('color') ?? 'orange';
        const image   = interaction.options.getString('image');
        const ping    = interaction.options.getString('ping');

        // Rakennetaan embed utils/embed.js:n announceEmbed-pohjalla
        const embed = announceEmbed(title, message, {
            color: COLORS[color],
            image: image ?? undefined,
            footer: `Announced by ${interaction.user.username}`,
        });

        try {
            await channel.send({ content: ping ?? null, embeds: [embed] });
            await interaction.reply({ content: `✅ Announcement sent to ${channel}.`, ephemeral: true });
        } catch {
            await interaction.reply({ content: `❌ Failed to send announcement to ${channel}. Check my permissions.`, ephemeral: true });
        }
    },
};