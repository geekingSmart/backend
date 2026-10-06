# 💥 DDoS the Boss (Le Jeu Coopératif Ultime)

> Un jeu web multijoueur minimaliste où la seule façon de vaincre le boss (le serveur lui-même), c'est de se coordonner pour le "surcharger" (fausse attaque DDoS coopérative) avec des clics synchronisés et des mathématiques !

---

## 🎮 Le Concept

Le boss a **100 000 PV** et se régénère de **500 PV par seconde**. Pour le terrasser, la communauté doit s'allier en temps réel. Mais attention : certains boutons spéciaux se renforcent uniquement si plusieurs joueurs cliquent en même temps (attention aux malus si vous êtes seuls !).

### 🕹️ L'Arsenal
1. **Requête HTTP de base :** Inflige 1 dégât (limité à 1 clic/sec par joueur).
2. **Bouton Tactique (Fenêtre de 5 min) :** Dégâts calculés selon l'équation $x^2 - x$ (où $x$ est le nombre de joueurs qui ont cliqué dans la même fenêtre). Cooldown : 1h.
3. **Bouton Chaotique (Fenêtre de 1 min) :** Dégâts calculés selon $x^3 - x^2 - x$. Si vous êtes seul ($x=1$), vous soignez le boss ! Cooldown : 4h.
4. **Bouton Nucléaire (Fenêtre de 30s) :** Dégâts massifs basés sur $x^4 - x^3 - x^2 - x$. Cooldown : 24h.

---

## 🚀 Installation & Lancement Local

1. Clone le dépôt :
   ```bash
   git clone [https://github.com/ton-pseudo/ton-repo.git](https://github.com/ton-pseudo/ton-repo.git)
   cd ton-repo
