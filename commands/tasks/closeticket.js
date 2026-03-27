const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

// Dashboard-integraatio
let dashboard;
try { dashboard = require('../../api/server'); } catch { /* api ei käytössä */ }

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Closes the current support ticket.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                embeds: [errorEmbed('Invalid Channel', 'This command can only be used in a ticket channel.')],
                ephemeral: true,
            });
        }

        const channelId = interaction.channel.id;

        await interaction.reply('🔒 Closing ticket in 5 seconds...');

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
                // Ilmoitetaan dashboardille tiketin sulkemisesta
                dashboard?.closeTicketInternal?.(channelId);
            } catch (error) {
                console.error(error);
            }
        }, 5000);
    },
};