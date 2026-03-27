// api/server.js
// Express REST API + WebSocket -palvelin botin hallintapaneelia varten
//
// Käynnistetään automaattisesti maid.js:stä:
//   const { broadcast, updateState, setRoles } = require('./api/server');
//
// Portit:
//   DASHBOARD_PORT (default: 3000) — HTTP + WS

require('dotenv').config();

const express  = require('express');
const http     = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const path     = require('path');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

app.use(express.json());

// Tarjotaan dashboard.html suoraan api/-kansiosta
app.use(express.static(path.join(__dirname)));

// ─── Muisti ─────────────────────────────────────────────────────────────────
const MAX_LOGS = 100;
let logs    = [];          // Viimeisimmät 100 komento-/tapahtumalokit
let tickets = {};          // { channelId: { user, reason, openedAt } }
let roles   = [];          // [{ id, name, color, position }]
let botState = {
    status:    'offline',
    tag:       null,
    ping:      null,
    guilds:    0,
    members:   0,
    startedAt: null,
};

// ─── WebSocket ──────────────────────────────────────────────────────────────
// Lähetetään viesti kaikille yhdistetyille selaimille
const broadcast = (type, payload) => {
    const msg = JSON.stringify({ type, payload });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
};

wss.on('connection', ws => {
    // Lähetetään uudelle yhteydelle koko nykyinen tila heti
    ws.send(JSON.stringify({
        type: 'init',
        payload: { botState, logs, tickets, roles },
    }));
});

// ─── Sisäiset apufunktiot (kutsutaan maid.js:stä suoraan) ──────────────────
const updateState = (partial) => {
    botState = { ...botState, ...partial };
    broadcast('state', botState);
};

const setRoles = (roleArray) => {
    roles = roleArray;
    broadcast('roles', roles);
};

const addLog = (entry) => {
    const e = { ...entry, ts: Date.now() };
    logs.unshift(e);
    if (logs.length > MAX_LOGS) logs.pop();
    broadcast('log', e);
};

const openTicket = (channelId, user, reason) => {
    tickets[channelId] = { user, reason, openedAt: Date.now() };
    broadcast('tickets', tickets);
};

const closeTicketInternal = (channelId) => {
    delete tickets[channelId];
    broadcast('tickets', tickets);
};

// ─── Julkiset REST-endpointit (dashboard kutsuu näitä) ──────────────────────

// GET — Nykyinen tila
app.get('/api/state',   (_req, res) => res.json(botState));
app.get('/api/logs',    (_req, res) => res.json(logs));
app.get('/api/tickets', (_req, res) => res.json(tickets));
app.get('/api/roles',   (_req, res) => res.json(roles));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// POST — Lähetä announcement embed kanavalle
// Body: { title, message, channel (ID), color?, ping? }
app.post('/api/announce', async (req, res) => {
    const { title, message, channel: channelId, color, ping } = req.body;
    if (!title || !message || !channelId) {
        return res.status(400).json({ error: 'title, message, channel required' });
    }
    try {
        // Haetaan Discord-asiakas globaalin kautta (asetetaan maid.js:ssä)
        const client = global.discordClient;
        if (!client) return res.status(503).json({ error: 'Bot not ready' });
        const ch = await client.channels.fetch(channelId).catch(() => null);
        if (!ch) return res.status(404).json({ error: 'Channel not found' });
        const { announceEmbed, COLORS } = require('../utils/embed');
        const embed = announceEmbed(title, message, {
            color: COLORS[color] ?? COLORS.announce,
            footer: 'Announced via dashboard',
        });
        await ch.send({ content: ping || null, embeds: [embed] });
        addLog({ type: 'announce', event: 'announce', user: 'dashboard', command: 'announce' });
        res.json({ ok: true });
    } catch (e) {
        console.error('[api/announce]', e);
        res.status(500).json({ error: e.message });
    }
});

// POST — Lähetä tavallinen tekstiviesti kanavalle
// Body: { channel (ID), content }
app.post('/api/say', async (req, res) => {
    const { channel: channelId, content } = req.body;
    if (!channelId || !content) return res.status(400).json({ error: 'channel, content required' });
    try {
        const client = global.discordClient;
        if (!client) return res.status(503).json({ error: 'Bot not ready' });
        const ch = await client.channels.fetch(channelId).catch(() => null);
        if (!ch) return res.status(404).json({ error: 'Channel not found' });
        await ch.send(content);
        addLog({ type: 'say', event: 'say', user: 'dashboard', command: 'say' });
        res.json({ ok: true });
    } catch (e) {
        console.error('[api/say]', e);
        res.status(500).json({ error: e.message });
    }
});

// POST — Sulje tiketti dashboardilta
// Body: { channelId }
app.post('/api/ticket/close', async (req, res) => {
    const { channelId } = req.body;
    if (!channelId) return res.status(400).json({ error: 'channelId required' });
    try {
        const client = global.discordClient;
        if (!client) return res.status(503).json({ error: 'Bot not ready' });
        const ch = client.channels.cache.get(channelId);
        if (ch) {
            await ch.send('🔒 Closing ticket (closed via dashboard)...');
            setTimeout(() => ch.delete().catch(console.error), 3000);
        }
        closeTicketInternal(channelId);
        res.json({ ok: true });
    } catch (e) {
        console.error('[api/ticket/close]', e);
        res.status(500).json({ error: e.message });
    }
});

// POST — Käynnistä botti uudelleen
// Lähettää SIGTERM prosessille; PM2 / Docker käynnistää sen automaattisesti uudelleen
app.post('/api/restart', (_req, res) => {
    res.json({ ok: true, message: 'Restarting...' });
    console.log('[dashboard] Restart requested');
    setTimeout(() => process.exit(0), 500);
});

// ─── Sisäiset POST-endpointit (bot → api) ───────────────────────────────────
// Näitä voidaan käyttää vaihtoehtoisesti jos ei haluta käyttää suoria funktiokutsuja

app.post('/internal/state',        (req, res) => { updateState(req.body); res.sendStatus(200); });
app.post('/internal/log',          (req, res) => { addLog(req.body); res.sendStatus(200); });
app.post('/internal/ticket/open',  (req, res) => { openTicket(req.body.channelId, req.body.user, req.body.reason); res.sendStatus(200); });
app.post('/internal/ticket/close', (req, res) => { closeTicketInternal(req.body.channelId); res.sendStatus(200); });
app.post('/internal/roles',        (req, res) => { setRoles(req.body.roles); res.sendStatus(200); });

// ─── Käynnistys ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;
server.listen(PORT, () => {
    console.log(`[dashboard] http://localhost:${PORT}`);
});

module.exports = { broadcast, updateState, addLog, setRoles, openTicket, closeTicketInternal };
