const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Sends an embed message.'),
    async execute(interaction) {
        // Rakennetaan embed EmbedBuilder-luokalla (ketjutettu tyyli)
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)                          // Reunaviivan väri (hex)
            .setTitle('Otsikko tähän')                   // Embedin pääotsikko
            .setURL('https://discord.js.org/')           // Otsikosta klikkaamalla avautuva linkki
            .setAuthor({
                name: 'Kirjoittajan nimi',
                iconURL: 'https://i.imgur.com/AfFp7pu.png',
                url: 'https://discord.js.org',
            })
            .setDescription('Kuvaus tähän.')             // Pääsisältöteksti
            .setThumbnail('https://i.imgur.com/AfFp7pu.png') // Pieni kuva oikeassa yläkulmassa
            .addFields(
                { name: 'Kenttä', value: 'Kentän arvo' },
                { name: '\u200B', value: '\u200B' },     // Tyhjä välikenttä erottimena
                { name: 'Vierekkäinen kenttä', value: 'Arvo', inline: true },
                { name: 'Vierekkäinen kenttä', value: 'Arvo', inline: true },
            )
            .setImage('https://i.imgur.com/AfFp7pu.png') // Iso kuva embedin alaosassa
            .setTimestamp()                               // Aikaleima footerin viereen
            .setFooter({
                text: 'Alateksti tähän',
                iconURL: 'https://i.imgur.com/AfFp7pu.png',
            });

        // Lähetetään embed kanavalle
        await interaction.reply({ embeds: [embed] });
    },
};
