const { SlashCommandBuilder } = require('discord.js');

// Aikayksiköt millisekunteina laskentaa varten
const TIME_UNITS = {
    minutes: 60 * 1000,
    hours:   60 * 60 * 1000,
    days:    24 * 60 * 60 * 1000,
};

// Maksimiaika 7 vuorokautta millisekunteina
const MAX_TIME = 7 * TIME_UNITS.days;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Sets a reminder.')
        .addStringOption(option =>
            option.setName('reminder')
                .setDescription('What to remind you about.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('How long until the reminder.')
                .setMinValue(1)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('unit')
                .setDescription('Time unit.')
                .setRequired(true)
                .addChoices(
                    { name: 'Minutes', value: 'minutes' },
                    { name: 'Hours',   value: 'hours' },
                    { name: 'Days',    value: 'days' },
                )),
    async execute(interaction) {
        const reminder = interaction.options.getString('reminder', true);
        const amount   = interaction.options.getInteger('amount', true);
        const unit     = interaction.options.getString('unit', true);

        const delay = amount * TIME_UNITS[unit];

        // Tarkistetaan ettei muistutus ylitä 7 vrk rajaa
        if (delay > MAX_TIME) {
            return interaction.reply({ content: '⚠️ Reminder cannot be longer than 7 days.', ephemeral: true });
        }

        // Lasketaan Unix-timestamp muistutuksen ajankohdalle Discordin aikaleimaa varten
        const remindAt = Math.floor((Date.now() + delay) / 1000);

        await interaction.reply(`⏰ I'll remind you about **"${reminder}"** <t:${remindAt}:R>.`);

        // Asetetaan ajastin — huom: tämä on muistissa, eli botin uudelleenkäynnistys
        // poistaa kaikki odottavat muistutukset. Pysyvään tallennukseen tarvitaan tietokanta.
        setTimeout(async () => {
            try {
                await interaction.user.send(`⏰ Reminder: **${reminder}**`);
            } catch {
                // DM:ien lähettäminen voi epäonnistua jos käyttäjällä on ne estetty
                await interaction.followUp({ content: `⏰ <@${interaction.user.id}> Reminder: **${reminder}**` });
            }
        }, delay);
    },
};