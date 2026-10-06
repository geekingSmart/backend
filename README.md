# 💥 DDoS the Boss (Le Raid Coopératif Ultime)

> Un jeu web multijoueur minimaliste et absurde où la seule façon de vaincre un boss surpuissant, c'est de se coordonner pour le "surcharger" (fausse attaque DDoS coopérative) à grand coup de clics synchronisés et de mathématiques polynomiales !

---

## 🎮 Le Concept & La Difficulté Dynamique

Le boss n'a pas de PV fixes : **le jeu s'adapte chaque jour à sa propre popularité**. 
Le nombre de joueurs uniques connectés la veille ($x$) détermine la puissance du boss du jour selon une formule de sadique :

* **PV Max du Boss ($y$) :** $3600 \times x^{1.1}$
* **Régénération par seconde ($z$) :** $0.2 \times x$

Plus la communauté grandit, plus le boss devient un monstre légendaire le lendemain !

---

## 🕹️ L'Arsenal (Les Boutons d'Attaque)

Attention : certains boutons demandent d'être plusieurs en même temps dans une fenêtre de temps impartie. Si vous êtes seuls, les mathématiques peuvent se retourner contre vous !

1. **Requête HTTP de base :** Inflige **1 dégât** (limité à 1 clic/sec par joueur pour éviter les crampes).
2. **Bouton Tactique (Fenêtre de 5 min) :** Dégâts basés sur $x^2 - x$ *(Cooldown : 1h)*.
3. **Bouton Chaotique (Fenêtre de 1 min) :** Dégâts basés sur $x^3 - x^2 - x$ *(Cooldown : 4h)*.
4. **Bouton Nucléaire (Fenêtre de 30s) :** Dégâts massifs basés sur $x^4 - x^3 - x^2 - x$ *(Cooldown : 24h)*.

---

## 🚀 Installation & Lancement Local

1. Clone le dépôt :
   ```bash
   git clone [https://github.com/ton-pseudo/ddos-the-boss.git](https://github.com/ton-pseudo/ddos-the-boss.git)
   cd ddos-the-boss
