const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// Aseta tähän sen kategorian ID johon tikettikanavat luodaan
// Löydät ID:n Discordissa: Asetukset -> Edistynyt -> Kehittäjätila päälle,
// sitten oikeaklikkaa kategoriaa ja valitse "Copy ID"
const TICKET_CATEGORY_ID = '1486690388948553728';

module.exports = {
    cooldown: 30, // Pidempi cooldown estää tikettien roskapostittamisen
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Opens a support ticket.')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for opening a ticket.')
                .setRequired(true)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason', true);
        const guild  = interaction.guild;

        // Tarkistetaan onko käyttäjällä jo auki oleva tiketti
        // Tikettikanavan nimi on muodossa "ticket-käyttäjänimi"
        const existingTicket = guild.channels.cache.find(
            ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}`
        );

        if (existingTicket) {
            return interaction.reply({
                content: `❌ You already have an open ticket: ${existingTicket}.`,
                ephemeral: true,
            });
        }

        try {
            // Luodaan uusi tekstikanava tikettikategoriaan
            const ticketChannel = await guild.channels.create({
                name: `ticket-${interaction.user.username.toLowerCase()}`,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID, // Tikettien kategoria
                permissionOverwrites: [
                    {
                        // @everyone ei näe kanavaa oletuksena
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        // Tiketin avaaja näkee ja voi kirjoittaa kanavalle
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        // Botti tarvitsee oikeudet hallitakseen kanavaa
                        id: interaction.client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                    },
                ],
            });

            // Lähetetään aloitusviesti tikettikanavalle
            const embed = new EmbedBuilder()
                .setColor(0x00cc99)
                .setTitle('🎫 Support Ticket')
                .setDescription(`Hello <@${interaction.user.id}>! Support will be with you shortly.\n\n**Reason:** ${reason}`)
                .setFooter({ text: 'To close this ticket, use /closeticket' })
                .setTimestamp();

            await ticketChannel.send({ embeds: [embed] });

            await interaction.reply({
                content: `✅ Your ticket has been created: ${ticketChannel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to create ticket. Make sure the category ID is correct and I have the necessary permissions.',
                ephemeral: true,
            });
        }
    },
};