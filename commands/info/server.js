const { SlashCommandBuilder } = require( "discord.js" );

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild sisältää tiedot palvelimesta jolla komento ajettiin
        // Huom: toimii vain palvelimella, ei DM-viesteissä
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};