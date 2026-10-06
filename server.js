const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// État du Boss
let boss = {
    maxHp: 100000,
    hp: 100000,
    regenRate: 500, // PV par seconde
    isAlive: true,
    dayCount: 1,
    lastKillTime: null
};

// Cooldowns par IP (Map stockant les timestamps)
let cooldownsBtn1 = new Map(); // 1 seconde max
let cooldownsBtn2 = new Map(); // 1 heure
let cooldownsBtn3 = new Map(); // 4 heures
let cooldownsBtn4 = new Map(); // 24 heures

// Tableaux pour les fenêtres temporelles des équations
let clicksBtn2 = []; // Fenêtre 5 min (300000 ms)
let clicksBtn3 = []; // Fenêtre 1 min (60000 ms)
let clicksBtn4 = []; // Fenêtre 30 sec (30000 ms)

// Fonction utilitaire pour anonymiser et identifier l'IP
function getUserHash(req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    return crypto.createHash('md5').update(ip).digest('hex').substring(0, 8);
}

// Boucle de régénération du boss (chaque seconde)
setInterval(() => {
    if (boss.isAlive && boss.hp < boss.maxHp) {
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.regenRate);
    }
}, 1000);

// Route d'état
app.get('/api/boss', (req, res) => {
    res.json(boss);
});

// Bouton 1 : Requête HTTP de base (1 dégât | 1s cooldown)
app.post('/api/hit/1', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });

    const userHash = getUserHash(req);
    const now = Date.now();
    if (now - (cooldownsBtn1.get(userHash) || 0) < 1000) {
        return res.status(429).json({ erreur: "Calme-toi ! 1 clic par seconde max." });
    }

    cooldownsBtn1.set(userHash, now);
    boss.hp = Math.max(0, boss.hp - 1);
    checkBossDeath();
    res.json({ degats: 1, hpRestants: boss.hp });
});

// Bouton 2 : Tactique (x² - x | 5 min fenêtre | 1h cooldown)
app.post('/api/hit/2', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });

    const userHash = getUserHash(req);
    const now = Date.now();
    if (now - (cooldownsBtn2.get(userHash) || 0) < 3600000) {
        const minRestants = Math.ceil((3600000 - (now - cooldownsBtn2.get(userHash))) / 60000);
        return res.status(429).json({ erreur: `Bouton Tactique en recharge ! (${minRestants} min)` });
    }

    cooldownsBtn2.set(userHash, now);
    clicksBtn2.push(now);
    clicksBtn2 = clicksBtn2.filter(t => now - t <= 300000);

    const x = clicksBtn2.length;
    const degats = (x * x) - x;

    boss.hp = Math.max(0, boss.hp - degats);
    checkBossDeath();
    res.json({ x, degats, hpRestants: boss.hp });
});

// Bouton 3 : Chaotique (x³ - x² - x | 1 min fenêtre | 4h cooldown)
app.post('/api/hit/3', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });

    const userHash = getUserHash(req);
    const now = Date.now();
    if (now - (cooldownsBtn3.get(userHash) || 0) < 14400000) {
        const minRestants = Math.ceil((14400000 - (now - cooldownsBtn3.get(userHash))) / 60000);
        return res.status(429).json({ erreur: `Bouton Chaotique en recharge ! (${minRestants} min)` });
    }

    cooldownsBtn3.set(userHash, now);
    clicksBtn3.push(now);
    clicksBtn3 = clicksBtn3.filter(t => now - t <= 60000);

    const x = clicksBtn3.length;
    const degats = Math.pow(x, 3) - Math.pow(x, 2) - x;

    boss.hp = Math.max(0, boss.hp - degats);
    checkBossDeath();
    res.json({ x, degats, hpRestants: boss.hp });
});

// Bouton 4 : Nucléaire (x⁴ - x³ - x² - x | 30s fenêtre | 24h cooldown)
app.post('/api/hit/4', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });

    const userHash = getUserHash(req);
    const now = Date.now();
    if (now - (cooldownsBtn4.get(userHash) || 0) < 86400000) {
        const hRestants = Math.ceil((86400000 - (now - cooldownsBtn4.get(userHash))) / 3600000);
        return res.status(429).json({ erreur: `Bouton Nucléaire en recharge ! (${hRestants} h)` });
    }

    cooldownsBtn4.set(userHash, now);
    clicksBtn4.push(now);
    clicksBtn4 = clicksBtn4.filter(t => now - t <= 30000);

    const x = clicksBtn4.length;
    const degats = Math.pow(x, 4) - Math.pow(x, 3) - Math.pow(x, 2) - x;

    boss.hp = Math.max(0, boss.hp - degats);
    checkBossDeath();
    res.json({ x, degats, hpRestants: boss.hp });
});

function checkBossDeath() {
    if (boss.hp <= 0 && boss.isAlive) {
        boss.isAlive = false;
        boss.hp = 0;
        
        // Respawn automatique après 30 secondes pour lancer le jour suivant
        setTimeout(() => {
            boss.maxHp = 100000;
            boss.hp = 100000;
            boss.isAlive = true;
            boss.dayCount += 1;
            clicksBtn2 = [];
            clicksBtn3 = [];
            clicksBtn4 = [];
        }, 30000);
    }
}

app.listen(PORT, () => {
    console.log(`Serveur du Boss actif sur le port ${PORT}`);
});
