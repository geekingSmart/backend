const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Pour hasher l'IP
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Notre base de données temporaire en RAM
let fileMessages = [];

// 1. Les sites web appellent cette route pour ENVOYER un message
app.post('/api/envoyer', (req, res) => {
    const texte = req.body.texte;
    if (!texte) return res.status(400).json({ erreur: "Message vide" });

    // Récupération de l'IP du visiteur
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Création d'un petit ID unique (Hash MD5 court de l'IP)
    const userHash = crypto.createHash('md5').update(ip).digest('hex').substring(0, 6);

    const nouveauMessage = {
        id_utilisateur: `User_${userHash}`,
        message: texte,
        heure: new Date().toLocaleTimeString('fr-FR')
    };

    fileMessages.push(nouveauMessage);
    
    // On garde uniquement les 50 derniers messages pour ne pas exploser tes 512 Mo de RAM !
    if (fileMessages.length > 50) fileMessages.shift();

    res.json({ statut: "Envoyé", ton_id: `User_${userHash}` });
});

// 2. Ton PC appelle cette route pour RÉCUPÉRER tous les messages
app.get('/api/recevoir-pc', (req, res) => {
    // On renvoie la liste et on la vide pour le prochain coup (comme ça ton PC ne lit que les NOUVEAUX messages)
    const messagesAEnvoyer = [...fileMessages];
    fileMessages = []; // On vide la boîte aux lettres
    res.json(messagesAEnvoyer);
});

app.listen(PORT, () => console.log(`Serveur d'interconnexion actif sur le port ${PORT}`));
