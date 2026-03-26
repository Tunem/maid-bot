const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Värivaihtoehdot announcen embediin
const COLORS = {
    blue:   0x0099ff,
    green:  0x00cc99,
    red:    0xff3333,
    yellow: 0xffcc00,
    orange: 0xff9900,
    purple: 0x9b59b6,
};

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
                .setRequired(true))
        // Väri on valinnainen — oletuksena oranssi
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
        // Valinnainen kuva embedin alaosaan
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Image URL to attach to the announcement.')
                .setRequired(false))
        // Valinnainen ping — ilmoittaa @everyone tai @here
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

        const embed = new EmbedBuilder()
            .setColor(COLORS[color])
            .setTitle('📢 ' + title)
            .setDescription(message)
            .setFooter({ text: `Announced by ${interaction.user.username}` })
            .setTimestamp();
 
        // Lisätään kuva embediin jos annettu
        if (image) embed.setImage(image);
 
        try {
            // Lähetetään ilmoitus valittuun kanavaan, ping mukaan jos valittu
            await channel.send({
                content: ping ?? null,
                embeds: [embed],
            });
            await interaction.reply({ content: `✅ Announcement sent to ${channel}.`, ephemeral: true });
        } catch {
            // Epäonnistuu jos botilla ei ole oikeuksia kirjoittaa kyseiselle kanavalle
            await interaction.reply({ content: `❌ Failed to send announcement to ${channel}. Check my permissions.`, ephemeral: true });
        }
    },
};