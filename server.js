const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Suivi des joueurs uniques par jour
let uniquePlayersToday = new Set();
let uniquePlayersYesterdayCount = 0;

// Fonction de calcul des stats du boss selon ta formule
function calculerStatsBoss(joueursHier) {
    let x = joueursHier || 0;
    
    // Évite les erreurs de log(0)
    let logX = x > 0 ? Math.log(x) : 0;
    
    // y = log(x)*1000 + x (ou 1000 si NaN / 0)
    let y = (logX * 1000) + x;
    if (isNaN(y) || y <= 0) y = 1000;
    
    // z = log(y)*100 + x (ou 0 si NaN)
    let logY = y > 0 ? Math.log(y) : 0;
    let z = (logY * 100) + x;
    if (isNaN(z) || z < 0) z = 0;

    return {
        maxHp: Math.round(y),
        hp: Math.round(y),
        regenRate: Math.max(10, Math.round(z)) // On met un minimum de 10 PV/s pour garder du challenge
    };
}

// État initial du Boss (Jour 1 avec stats de base)
let statsInitiales = calculerStatsBoss(0);
let boss = {
    maxHp: statsInitiales.maxHp,
    hp: statsInitiales.hp,
    regenRate: statsInitiales.regenRate,
    isAlive: true,
    dayCount: 1
};

// Cooldowns par IP (Map stockant les timestamps)
let cooldownsBtn1 = new Map(); // 1 seconde max
let cooldownsBtn2 = new Map(); // 1 heure
let cooldownsBtn3 = new Map(); // 4 heures
let cooldownsBtn4 = new Map(); // 24 heures

// Tableaux pour les fenêtres temporelles des équations
let clicksBtn2 = []; 
let clicksBtn3 = []; 
let clicksBtn4 = []; 

// Fonction pour enregistrer et identifier l'IP du joueur du jour
function trackPlayer(req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userHash = crypto.createHash('md5').update(ip).digest('hex').substring(0, 8);
    uniquePlayersToday.add(userHash);
    return userHash;
}

// Boucle de régénération du boss (chaque seconde)
setInterval(() => {
    if (boss.isAlive && boss.hp < boss.maxHp) {
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.regenRate);
    }
}, 1000);

// Route d'état
app.get('/api/boss', (req, res) => {
    trackPlayer(req);
    res.json({ ...boss, playersToday: uniquePlayersToday.size });
});

// Bouton 1 : Requête HTTP de base (1 dégât | 1s cooldown)
app.post('/api/hit/1', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });

    const userHash = trackPlayer(req);
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

    const userHash = trackPlayer(req);
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

    const userHash = trackPlayer(req);
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

    const userHash = trackPlayer(req);
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
        
        // Sauvegarde du nombre de joueurs d'hier pour le calcul du lendemain
        uniquePlayersYesterdayCount = uniquePlayersToday.size;
        uniquePlayersToday.clear(); // On reset pour le nouveau jour
        
        // Respawn automatique après 30 secondes avec les nouvelles stats basées sur la formule
        setTimeout(() => {
            const nouvellesStats = calculerStatsBoss(uniquePlayersYesterdayCount);
            boss.maxHp = nouvellesStats.maxHp;
            boss.hp = nouvellesStats.maxHp;
            boss.regenRate = nouvellesStats.regenRate;
            boss.isAlive = true;
            boss.dayCount += 1;
            clicksBtn2 = [];
            clicksBtn3 = [];
            clicksBtn4 = [];
        }, 30000);
    }
}

app.listen(PORT, () => {
    console.log(`Serveur du Boss dynamique actif sur le port ${PORT}`);
});
