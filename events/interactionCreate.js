const { Events, Collection } = require('discord.js');
const { errorEmbed, warningEmbed } = require('../utils/embed');

module.exports = {
    name: Events.InteractionCreate, // Tapahtuma laukeaa joka kerta kun käyttäjä tekee interaktion
    async execute(interaction) {
        // Ohitetaan kaikki muut interaktiot paitsi slash-komennot
        if (!interaction.isChatInputCommand()) return;

        // Haetaan komento asiakkaan commands-kokoelmasta komennon nimellä
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // --- Cooldown-logiikka ---
        const { cooldowns } = interaction.client;

        // Jos komennolle ei ole vielä cooldown-kokoelmaa, luodaan sellainen
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name); // Käyttäjä-ID -> viimeisin käyttöaika
        const defaultCooldownDuration = 3; // sekuntia
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000; // muutetaan millisekunneiksi

        if (timestamps.has(interaction.user.id)) {
            // Käyttäjällä on aiempi timestamp — tarkistetaan onko cooldown vielä voimassa
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                // Cooldown on voimassa, ilmoitetaan käyttäjälle milloin se päättyy
                const expirationTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({
                    embeds: [warningEmbed('Cooldown', `You are on cooldown for \`${command.data.name}\`. You can use it again <t:${expirationTimestamp}:R>.`)],
                    ephemeral: true,
                });
            }
        }

        // Asetetaan timestamp tähän hetkeen (sekä ensimmäisellä että uusintakäytöllä)
        timestamps.set(interaction.user.id, now);
        // Poistetaan timestamp automaattisesti cooldown-ajan kuluttua
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // --- Komennon suoritus ---
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            // Jos vastaus on jo lähetetty tai lykätty, käytetään followUp, muuten reply
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [errorEmbed('Error', 'There was an error while executing this command!')],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed('Error', 'There was an error while executing this command!')],
                    ephemeral: true,
                });
            }
        }
    },
};