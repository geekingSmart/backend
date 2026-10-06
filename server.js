const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// La boîte aux lettres vide au démarrage
let donneesMonPC = {
    ram_libre: "En attente...",
    ram_totale: "En attente...",
    statut: "Éteint 🔴"
};

// 1. Route pour que ton script Python envoie les infos
app.post('/api/update-pc', (req, res) => {
    donneesMonPC = {
        ram_libre: req.body.ram_libre,
        ram_totale: req.body.ram_totale,
        statut: "Allumé 🟢",
        derniere_maj: new Date().toLocaleTimeString('fr-FR')
    };
    res.json({ message: "Données du PC reçues !" });
});

// 2. Route pour que ton site Mimo vienne lire les infos
app.get('/api/statut-pc', (req, res) => {
    res.json(donneesMonPC);
});

app.listen(PORT, () => console.log(`Serveur Relais lancé sur le port ${PORT}`));
