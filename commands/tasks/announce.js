const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Sends a formatted announcement embed to a channel.')
        // Rajoitetaan komento vain admineille Discord-tasolla
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
                .setRequired(true)),
    async execute(interaction) {
        const title   = interaction.options.getString('title', true);
        const message = interaction.options.getString('message', true);
        const channel = interaction.options.getChannel('channel', true);

        const embed = new EmbedBuilder()
            .setColor(0xff9900)
            .setTitle('📢 ' + title)
            .setDescription(message)
            .setFooter({ text: `Announced by ${interaction.user.username}` })
            .setTimestamp();

        try {
            // Lähetetään ilmoitus valittuun kanavaan
            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: `✅ Announcement sent to ${channel}.`, ephemeral: true });
        } catch {
            // Epäonnistuu jos botilla ei ole oikeuksia kirjoittaa kyseiselle kanavalle
            await interaction.reply({ content: `❌ Failed to send announcement to ${channel}. Check my permissions.`, ephemeral: true });
        }
    },
};