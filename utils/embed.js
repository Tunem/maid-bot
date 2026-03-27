// Apumoduuli embed-viestien rakentamiseen
// Tarjoaa sekä vapaan buildEmbed()-funktion että valmiita pohjia yleisiin tilanteisiin

const { EmbedBuilder } = require('discord.js');

// Väripaletti valmiita pohjia varten
const COLORS = {
    info:    0x0099ff, // Sininen — yleinen info
    success: 0x00cc99, // Vihreä — onnistuminen
    warning: 0xffcc00, // Keltainen — varoitus
    error:   0xff3333, // Punainen — virhe
    announce:0xff9900, // Oranssi — ilmoitus
    neutral: 0x99aab5, // Harmaa — neutraali
};

// Rakentaa embedin vapaasti annetuilla parametreilla
// Kaikki kentät valinnaisia — käytä vain tarvitsemiasi
const buildEmbed = ({ title, description, color, fields, thumbnail, image, footer, timestamp } = {}) => {
    const embed = new EmbedBuilder();

    if (title)       embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (color)       embed.setColor(color);
    if (thumbnail)   embed.setThumbnail(thumbnail);
    if (image)       embed.setImage(image);
    if (timestamp)   embed.setTimestamp();
    if (footer)      embed.setFooter(typeof footer === 'string' ? { text: footer } : footer);
    if (fields?.length) embed.addFields(fields);

    return embed;
};

// --- Valmiit pohjat yleisiin tilanteisiin ---

// Yleinen info-viesti
const infoEmbed = (title, description) =>
    buildEmbed({ title, description, color: COLORS.info, timestamp: true });

// Onnistumisviesti (esim. komento onnistui)
const successEmbed = (title, description) =>
    buildEmbed({ title: '✅ ' + title, description, color: COLORS.success, timestamp: true });

// Varoitusviesti (esim. väärä syöte)
const warningEmbed = (title, description) =>
    buildEmbed({ title: '⚠️ ' + title, description, color: COLORS.warning, timestamp: true });

// Virheviesti (esim. komento epäonnistui)
const errorEmbed = (title, description) =>
    buildEmbed({ title: '❌ ' + title, description, color: COLORS.error, timestamp: true });

// Ilmoituspohja (käytetään /announce-komennossa)
const announceEmbed = (title, description, { color = COLORS.announce, image, footer } = {}) =>
    buildEmbed({ title: '📢 ' + title, description, color, image, footer, timestamp: true });

module.exports = { buildEmbed, infoEmbed, successEmbed, warningEmbed, errorEmbed, announceEmbed, COLORS };