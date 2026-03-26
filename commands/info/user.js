const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user = Discord-käyttäjätili (sama kaikkialla)
        // interaction.member = palvelinkohtainen jäsen (nimi, roolit, liittymisaika jne.)
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	},
};