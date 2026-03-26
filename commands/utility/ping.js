const { SlashCommandBuilder } = require( 'discord.js' );

module.exports = {
    cooldown: 5, // Cooldown sekunteina, estää roskapostittamisen
    data: new SlashCommandBuilder()
	    .setName('ping')
	    .setDescription('Replies with Pong!'),
    async execute(interaction) {
        // Yksinkertainen vastauskomento yhteyden testaamiseen
        await interaction.reply('Pong!');
    },
};