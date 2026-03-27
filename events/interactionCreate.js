const { Events, Collection } = require('discord.js');
const { errorEmbed, warningEmbed } = require('../utils/embed');

// Dashboard-integraatio: lokataan komennot reaaliajassa
let dashboard;
try { dashboard = require('../api/server'); } catch { /* api ei käytössä */ }

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // --- Cooldown-logiikka ---
        const { cooldowns } = interaction.client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now                  = Date.now();
        const timestamps           = cooldowns.get(command.data.name);
        const defaultCooldown      = 3;
        const cooldownAmount       = (command.cooldown ?? defaultCooldown) * 1_000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const expirationTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({
                    embeds: [warningEmbed('Cooldown', `You are on cooldown for \`${command.data.name}\`. You can use it again <t:${expirationTimestamp}:R>.`)],
                    ephemeral: true,
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // --- Komennon suoritus ---
        try {
            await command.execute(interaction);

            // Lokataan onnistunut komento dashboardille
            if (dashboard?.addLog) {
                dashboard.addLog({
                    type:    'command',
                    command: interaction.commandName,
                    user:    interaction.user.tag,
                    guild:   interaction.guild?.name ?? 'DM',
                });
            }
        } catch (error) {
            console.error(error);

            // Lokataan virhe dashboardille
            if (dashboard?.addLog) {
                dashboard.addLog({
                    type:    'error',
                    command: interaction.commandName,
                    user:    interaction.user.tag,
                    guild:   interaction.guild?.name ?? 'DM',
                });
            }

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