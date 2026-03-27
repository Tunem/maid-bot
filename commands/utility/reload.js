const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply({
                embeds: [errorEmbed('Not Found', `There is no command with name \`${commandName}\`!`)],
                ephemeral: true,
            });
        }

        // Etsitään komennon tiedosto käymällä commands/-alikansiot läpi
        // __dirname on commands/utility/, joten '../' vie commands/-kansioon
        const foldersPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(foldersPath).filter(f =>
            fs.statSync(path.join(foldersPath, f)).isDirectory()
        );

        let commandFilePath = null;
        for (const folder of commandFolders) {
            const folderPath = path.join(foldersPath, folder);
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
            for (const file of files) {
                if (file === `${commandName}.js`) {
                    commandFilePath = path.join(folderPath, file);
                    break;
                }
            }
            if (commandFilePath) break;
        }

        if (!commandFilePath) {
            return interaction.reply({
                embeds: [errorEmbed('Not Found', `Could not find the file for command \`${commandName}\`.`)],
                ephemeral: true,
            });
        }

        // Poistetaan vanha versio Node.js:n require-välimuistista
        // jotta tiedosto luetaan uudelleen levyltä eikä muistista
        delete require.cache[require.resolve(commandFilePath)];

        try {
            // Ladataan komento uudelleen ja päivitetään kokoelmaan
            interaction.client.commands.delete(commandName);
            const newCommand = require(commandFilePath);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({
                embeds: [successEmbed('Reloaded', `Command \`${newCommand.data.name}\` was reloaded!`)],
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                embeds: [errorEmbed('Reload Failed', `There was an error while reloading \`${commandName}\`:\n\`${error.message}\``)],
                ephemeral: true,
            });
        }
    },
};