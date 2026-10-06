const express = require('express');
const cors = require('cors');
const os = require('os'); // Module natif pour la RAM
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors()); 
app.use(express.json());

// On enregistre l'heure exacte du démarrage du serveur
const heureDemarrage = Date.now();

app.get('/api/moula', (req, res) => {
    // 1. Calcul du temps écoulé en secondes
    const secondesAlume = Math.floor((Date.now() - heureDemarrage) / 1000);
    
    // 2. Calcul de la RAM libre (os.freemem() donne des octets, on convertit en Mo)
    const ramLibreMo = Math.floor(os.freemem() / (1024 * 1024));
    
    // 3. Optionnel : RAM totale pour voir tes 512 Mo
    const ramTotaleMo = Math.floor(os.totalmem() / (1024 * 1024));

    res.json({ 
        statut: "Succès", 
        message: "En route vers le vrai PC !",
        uptime: `Je suis allumé depuis ${secondesAlume} secondes ⚡`,
        ram: `Il me reste ${ramLibreMo} Mo de RAM libre sur ${ramTotaleMo} Mo 🧠`
    });
});

app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
