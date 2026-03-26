// Jaettu apumoduuli profiilikortin piirtämiseen
// Käytetään sekä /profile-komennossa että welcome-tapahtumassa

const { AttachmentBuilder } = require('discord.js');
const { readFile } = require('fs/promises');
const { createCanvas, Image, GlobalFonts } = require('@napi-rs/canvas');
const { request } = require('undici');
const { resolve } = require('path');

// Rekisteröidään Roboto-fontti canvasia varten — ajetaan vain kerran moduulin latautuessa
GlobalFonts.registerFromPath(resolve('./assets/roboto_5.0.8/ttf/roboto-latin-300-normal.ttf'), 'Roboto');
// Debug: uncomment jos fontti ei löydy
// console.log(GlobalFonts.families.find((font) => font.family === 'Roboto'));

// Sovitetaan fonttikoko automaattisesti niin että teksti mahtuu canvakselle
// Pienentää 10px kerrallaan kunnes teksti mahtuu (canvas.width - 300) pikseliin
const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 70;

    do {
        context.font = `${fontSize -= 10}px Roboto`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
};

// Piirtää profiilikortin ja palauttaa sen Discord-liitteenä
// displayName: käyttäjän näyttönimi palvelimella
// avatarURL: käyttäjän avatar-URL
const buildProfileCard = async (displayName, avatarURL) => {
    // Luodaan 700x250 canvas profiilikorttia varten
    const canvas = createCanvas(700, 250);
    const context = canvas.getContext('2d');

    // Piirretään taustakuva koko canvaksen kokoiseksi
    const background = await readFile('./assets/canvas.jpg');
    const backgroundImage = new Image();
    backgroundImage.src = background;
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Piirretään sininen reunaviiva canvaksen ympärille
    context.strokeStyle = '#0099ff';
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Kirjoitetaan "Profile"-otsikko
    context.font = '28px Roboto';
    context.fillStyle = '#ffffff';
    context.fillText('Profile', canvas.width / 2.5, canvas.height / 3.5);

    // Kirjoitetaan käyttäjän näyttönimi automaattisesti sovitetulla fonttikoolla
    context.font = applyText(canvas, `${displayName}!`);
    context.fillStyle = '#ffffff';
    context.fillText(displayName, canvas.width / 2.5, canvas.height / 1.8);

    // Leikataan canvaksesta pyöreä alue avataria varten (clip)
    // arc(x, y, säde, alkukulma, loppukulma)
    context.beginPath();
    context.arc(125, 125, 100, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    // Haetaan käyttäjän avatar verkosta ja piirretään se pyöreään alueeseen
    const { body } = await request(avatarURL);
    const avatar = new Image();
    avatar.src = Buffer.from(await body.arrayBuffer());
    context.drawImage(avatar, 25, 25, 200, 200);

    // Palautetaan canvas Discord-liitteenä
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });
};

module.exports = { buildProfileCard };