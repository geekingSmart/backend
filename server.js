const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors()); 
app.use(express.json());

app.get('/api/moula', (req, res) => {
    const maCleSecrete = process.env.MA_CLE_PRIVEE || "Pas de clé configurée";
    res.json({ 
        statut: "Succès", 
        message: "En route vers le vrai PC !",
        cle_recuperee: maCleSecrete
    });
});

app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
