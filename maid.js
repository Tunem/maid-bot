require('dotenv').config(); // Ladataan .env-tiedoston muuttujat (esim. DISCORD_TOKEN)
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Luodaan Discord-asiakasinstanssi
// GatewayIntentBits.Guilds tarvitaan palvelin- ja kanavaoperaatioihin
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
] });

// Alustetaan kokoelmat komennoille ja cooldowneille asiakkaan päälle,
// jotta ne ovat saatavilla kaikissa tapahtumankäsittelijöissä
client.cooldowns = new Collection();
client.commands = new Collection();

// --- Komentojen lataus ---
// Haetaan kaikki komennot commands/-hakemiston alikansioista
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for ( const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Tarkistetaan että komennolla on vaaditut kentät ennen rekisteröintiä
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// --- Tapahtumankäsittelijöiden lataus ---
// Haetaan kaikki tapahtumat events/-hakemistosta
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for ( const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	// once: true tarkoittaa että tapahtuma kuunnellaan vain kerran (esim. ready)
    // once: false (tai puuttuu) tarkoittaa toistuvaa kuuntelua (esim. interactionCreate)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Kirjaudutaan Discordiin .env-tiedoston tokenilla
client.login(process.env.DISCORD_TOKEN);