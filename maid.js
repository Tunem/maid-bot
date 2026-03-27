require('dotenv').config();
const fs   = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
] });

client.cooldowns = new Collection();
client.commands  = new Collection();

// --- Komentojen lataus ---
const foldersPath   = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath  = path.join(commandsPath, file);
        const command   = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// --- Tapahtumankäsittelijöiden lataus ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event    = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// ─── Dashboard API ──────────────────────────────────────────────────────────
// Käynnistetään Express + WebSocket -palvelin
const dashboard = require('./api/server');

// Tehdään Discord-asiakas saataville API-palvelimelle globaalin kautta
// Tarvitaan /api/announce, /api/say ja /api/ticket/close -endpointeissa
global.discordClient = client;

// Kun botti on valmis, päivitetään tila dashboardille
client.once(Events.ClientReady, () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    dashboard.updateState({
        status:    'online',
        tag:       client.user.tag,
        guilds:    client.guilds.cache.size,
        members:   client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
        startedAt: Date.now(),
        ping:      client.ws.ping,
    });

    // Lähetetään roolit ensimmäiseltä palvelimelta (muokkaa tarvittaessa)
    const firstGuild = client.guilds.cache.first();
    if (firstGuild) {
        firstGuild.roles.fetch().then(roles => {
            const roleData = roles
                .filter(r => r.name !== '@everyone')
                .sort((a, b) => b.position - a.position)
                .map(r => ({ id: r.id, name: r.name, color: r.color, position: r.position }));
            dashboard.setRoles(roleData);
        });
    }

    // Päivitetään ping 30 sekunnin välein
    setInterval(() => {
        dashboard.updateState({ ping: client.ws.ping });
    }, 30_000);
});

// Kun botti katkaistaan, merkitään offline
client.on(Events.ShardDisconnect, () => {
    dashboard.updateState({ status: 'offline', ping: null });
});

client.login(process.env.DISCORD_TOKEN);