const express = require('express');
const path = require('path');
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
    currentDayPlayer: "Anonyme",
    killTimeSeconds: null
};

// Tableaux pour stocker les horodatages des clics des boutons tactiques
let clicksBtn2 = []; // Fenêtre 5 min (300s)
let clicksBtn3 = []; // Fenêtre 1 min (60s)
let clicksBtn4 = []; // Fenêtre 30 sec (30s)

// Boucle de régénération du boss (tourne chaque seconde)
setInterval(() => {
    if (boss.isAlive && boss.hp < boss.maxHp) {
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.regenRate);
    }
}, 1000);

// Route pour récupérer l'état du boss
app.get('/api/boss', (req, res) => {
    res.json(boss);
});

// Route pour frapper avec le Bouton 1 (Requête HTTP de base)
app.post('/api/hit/1', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est déjà mort !" });
    
    boss.hp = Math.max(0, boss.hp - 1); // 1 dégât par clic de base
    checkBossDeath();
    res.json({ degats: 1, hpRestants: boss.hp });
});

// Route pour le Bouton 2 (Intervalle 5 min, équation x^2 - x)
app.post('/api/hit/2', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });
    
    const now = Date.now();
    clicksBtn2.push(now);
    clicksBtn2 = clicksBtn2.filter(t => now - t <= 300000);
    
    const x = clicksBtn2.length;
    const degats = (x * x) - x;
    
    boss.hp = Math.max(0, boss.hp - degats);
    checkBossDeath();
    res.json({ x, degats, hpRestants: boss.hp });
});

// Route pour le Bouton 3 (Intervalle 1 min, équation x^3 - x^2 - x)
app.post('/api/hit/3', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });
    
    const now = Date.now();
    clicksBtn3.push(now);
    clicksBtn3 = clicksBtn3.filter(t => now - t <= 60000);
    
    const x = clicksBtn3.length;
    const degats = Math.pow(x, 3) - Math.pow(x, 2) - x;
    
    boss.hp = Math.max(0, boss.hp - degats);
    checkBossDeath();
    res.json({ x, degats, hpRestants: boss.hp });
});

// Route pour le Bouton 4 (Intervalle 30s, équation x^4 - x^3 - x^2 - x)
app.post('/api/hit/4', (req, res) => {
    if (!boss.isAlive) return res.status(400).json({ erreur: "Le boss est mort !" });
    
    const now = Date.now();
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
    }
}

app.listen(PORT, () => {
    console.log(`Serveur du Boss actif sur le port ${PORT}`);
});
