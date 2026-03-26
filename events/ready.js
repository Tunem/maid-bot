const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady, // Laukeaa kun botti on kirjautunut ja valmis vastaanottamaan tapahtumia
    once: true, // once: true = kuunnellaan vain kerran (botti käynnistyy vain kerran)
    execute(client) {
        // client.user.tag on muotoa "BotinNimi#0000"
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};