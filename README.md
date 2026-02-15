# 🍽️ GastroChef - Le Menu Perdu

## 📋 Projet B3 Fullstack - Gestion de Ghost Kitchen

Un jeu interactif fullstack où vous incarnez un restaurateur reprenant un établissement légendaire sans le livre de recettes ! Achetez des ingrédients, découvrez des recettes au laboratoire, puis gérez le service en temps réel pour satisfaire vos clients et le redoutable critique gastronomique VIP.

### Stack Technique

- **Frontend** : React 18 + Vite
- **Backend** : Node.js + Express
- **Base de données** : MongoDB (Mongoose)
- **Temps réel** : Socket.io
- **Authentification** : JWT + bcryptjs
- **Graphiques** : Chart.js / react-chartjs-2
- **Conteneurisation** : Docker + docker-compose
- **Interface** : Responsive design (mobile/tablette/desktop)

---

## 🚀 Installation & Lancement

### Option 1 : Docker (recommandé)

```bash
docker-compose up --build
```

✅ Application accessible sur `http://localhost`  
✅ Backend sur `http://localhost:5000`  
✅ MongoDB sur `localhost:27017`

Peupler la base de données :

```bash
docker exec gastrochef-backend node seed.js
```

### Option 2 : Installation manuelle

#### Prérequis

- Node.js (v16+)
- MongoDB (local ou Atlas)
- npm

#### 1️⃣ Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` :

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gastro-chef
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Peupler la base de données (ingrédients & recettes) :

```bash
node seed.js
```

Lancer le serveur :

```bash
npm run dev
```

✅ Serveur accessible sur `http://localhost:5000`

#### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Application accessible sur `http://localhost:5173`

---

## 📋 Fonctionnalités

### ✅ Authentification (JWT)

- Page Register / Login
- Hashage des mots de passe (bcryptjs, salt 10)
- Token JWT (expiration 7 jours)
- Middleware de protection des routes

### ✅ Marché aux Ingrédients

- Achat d'ingrédients avec choix de quantité
- Affichage du stock et du coût unitaire
- Déduction automatique de la trésorerie
- Vérification de fonds avant achat
- **Gestion DLC** : affichage de la durée de conservation et dates d'expiration

### ✅ Le Laboratoire (Core Gameplay)

- Sélection d'ingrédients depuis le stock personnel
- Algorithme de matching ingrédients ↔ recettes
- Succès : recette débloquée et sauvegardée
- Échec : ingrédients consommés et détruits
- Vérification du stock avant chaque expérience (via `stockService`)

### ✅ Livre des Recettes

- Page récapitulative des recettes découvertes
- Détails : ingrédients requis, quantités, difficulté, description
- Affichage en grille responsive

### ✅ Le Service (Temps Réel - Socket.io)

- Commandes aléatoires poussées en temps réel via WebSocket
- Authentification JWT sur la connexion Socket
- Timer d'expiration par commande (30 s) avec barre de progression
- **Servir** : vérifie et consomme le stock d'ingrédients (FIFO), +revenu en trésorerie
- **Rejeter** : pénalité de satisfaction (-10) et de trésorerie (-15 G)
- **Expiration** : même pénalité qu'un rejet
- Affichage des ingrédients requis directement sur les cartes de commande
- Journal d'activité en temps réel
- Game Over si satisfaction < 0, trésorerie ≤ 0, ou étoiles = 0

### ⭐ Critique Gastronomique VIP (Nouveau)

- **Commandes VIP** : apparaissent aléatoirement (20% de chance)
- **Récompense** : prix x3 et +5 satisfaction si servie
- **Punition** : -50 G, -15 satisfaction et **perte d'une étoile** si ratée/rejetée/expirée
- **Système d'étoiles** : 3 étoiles au départ (★★★)
- **Game Over** : descente à 0 étoile = fin de partie (retiré du guide)
- Timer réduit (20 s au lieu de 30 s)
- Badge VIP doré et animation sur les cartes de commande

### 📦 Gestion des DLC - FIFO (Nouveau)

- **Lots de stock** : chaque achat crée un lot avec date d'achat et date d'expiration
- **FIFO** : les lots les plus anciens sont consommés en premier lors de la cuisson
- **Dates d'expiration** : chaque ingrédient a une durée de conservation (shelfLife)
- **Cron de nettoyage** : suppression automatique des lots périmés toutes les 60 secondes
- **Affichage DLC** : temps restant avant expiration visible sur les cartes d'achat

### 🐳 Docker (Nouveau)

- Lancement complet via `docker-compose up`
- 3 services : MongoDB, Backend (Node.js), Frontend (Nginx)
- Volumes persistants pour MongoDB
- Configuration nginx pour SPA + proxy API/WebSocket

### 📱 Interface Responsive (Nouveau)

- Design adaptatif pour mobile, tablette et desktop
- Breakpoints : 480px, 768px, 900px
- Grilles flexibles, boutons tactiles, navigation empilée

### ✅ Tableau de Bord Financier

- Trésorerie actuelle, revenus, dépenses, bénéfice net
- Graphique ligne : évolution de la trésorerie dans le temps
- Graphique donut : répartition des dépenses (achats vs pénalités)
- Tableau : bénéfice net par plat (revenu, coût ingrédients, marge)

---

## 📊 Modèles de Données (MongoDB)

| Modèle | Description |
|---|---|
| **User** | `restaurantName`, `email`, `password` (hashed), `satisfaction`, `treasury`, `stars` (3→0), `isServiceActive`, `createdAt` |
| **Recipe** | `name`, `requiredIngredients [{name, quantity}]`, `description`, `difficulty`, `price` |
| **Ingredient** | `name` (unique), `category`, `cost`, `shelfLife` (heures), `description` |
| **UserRecipe** | `userId`, `recipeId`, `discovered`, `discoveredAt` |
| **UserIngredient** | `userId`, `ingredientId`, `lots [{quantity, purchasedAt, expiresAt}]` (FIFO) |
| **Transaction** | `userId`, `type`, `amount`, `description`, `recipeId`, `ingredientId`, `createdAt` |

---

## 🔧 API Endpoints

### Auth

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter (retourne JWT) |

### Laboratoire (protégé)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/lab/experiment` | Tester une combinaison d'ingrédients |
| GET | `/api/lab/recipes/all` | Toutes les recettes existantes |
| GET | `/api/lab/recipes/my` | Recettes découvertes par l'utilisateur |

### Ingrédients / Stock (protégé)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/recipes` | Lister tous les ingrédients |
| GET | `/api/ingredients/stock` | Stock personnel (avec lots FIFO et DLC) |
| POST | `/api/ingredients/purchase` | Acheter un ingrédient (crée un lot FIFO) |

### Service (protégé)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/service/state` | État du service (satisfaction, étoiles, trésorerie) |
| POST | `/api/service/start` | Démarrer le service |
| POST | `/api/service/stop` | Arrêter le service |
| POST | `/api/service/serve` | Servir une commande (HTTP) |
| GET | `/api/service/discovered` | IDs des recettes découvertes |

### Transactions (protégé)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/transactions/treasury` | Trésorerie actuelle |
| GET | `/api/transactions/history` | Historique des transactions |
| GET | `/api/transactions/breakdown` | Répartition des dépenses |
| GET | `/api/transactions/profit-per-dish` | Bénéfice net par plat |

### WebSocket Events (Socket.io)

| Direction | Événement | Description |
|---|---|---|
| → Client | `service:start` | Démarrer le service |
| → Client | `service:stop` | Arrêter le service |
| → Client | `order:serve` | Servir une commande |
| → Client | `order:reject` | Rejeter une commande |
| ← Serveur | `service:started` | Confirmation service démarré (satisfaction, treasury, stars) |
| ← Serveur | `service:stopped` | Confirmation service arrêté |
| ← Serveur | `service:gameover` | Game over (satisfaction, trésorerie ou étoiles) |
| ← Serveur | `order:new` | Nouvelle commande (peut être `isVip: true`) |
| ← Serveur | `order:expired` | Commande expirée (VIP : -1 étoile) |
| ← Serveur | `order:serve_result` | Résultat du service (succès/échec stock) |
| ← Serveur | `order:rejected` | Confirmation rejet (VIP : -1 étoile) |

---

## 📁 Structure du Projet

```
RestaurantGastro/
├── docker-compose.yml               # Orchestration Docker (MongoDB + Backend + Frontend)
├── backend/
│   ├── Dockerfile                   # Image Docker backend
│   ├── .dockerignore
│   ├── config/
│   │   ├── db.js                    # Connexion MongoDB
│   │   └── constants.js             # Constantes du jeu (pénalités, VIP, FIFO, timers)
│   ├── controllers/
│   │   ├── authController.js        # Register / Login
│   │   ├── labController.js         # Expérimentation & matching
│   │   ├── ingredientController.js  # CRUD ingrédients
│   │   ├── ingredientStockController.js  # Achat FIFO & stock utilisateur
│   │   ├── serviceController.js     # Logique HTTP du service (+ étoiles)
│   │   └── transactionController.js # Dashboard financier
│   ├── cron/
│   │   └── expirationCron.js        # Cron de nettoyage des lots périmés
│   ├── middleware/
│   │   └── auth.js                  # Middleware JWT
│   ├── models/
│   │   ├── User.js                  # + champ stars (3→0)
│   │   ├── Recipe.js
│   │   ├── Ingredient.js            # + champ shelfLife
│   │   ├── UserRecipe.js
│   │   ├── UserIngredient.js        # Lots FIFO [{quantity, purchasedAt, expiresAt}]
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── lab.js
│   │   ├── recipes.js
│   │   ├── ingredients.js
│   │   ├── service.js
│   │   └── transactions.js
│   ├── services/
│   │   ├── stockService.js          # Vérification & consommation FIFO + nettoyage périmés
│   │   └── gameService.js           # Logique de jeu (pénalités, VIP, étoiles, game over)
│   ├── socket/
│   │   ├── index.js                 # Point d'entrée Socket.io + auth JWT
│   │   ├── sessionManager.js        # Gestion des sessions actives (Map)
│   │   ├── orderGenerator.js        # Génération aléatoire + commandes VIP
│   │   └── orderHandlers.js         # Handlers : serve, reject, expired (+ VIP)
│   ├── server.js                    # Point d'entrée Express (+ cron startup)
│   ├── seed.js                      # Script de peuplement (20 ingrédients + 8 recettes + shelfLife)
│   └── .env
│
├── frontend/
│   ├── Dockerfile                   # Image Docker frontend (multi-stage + nginx)
│   ├── .dockerignore
│   ├── nginx.conf                   # Configuration nginx SPA + proxy API/WebSocket
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Barre de navigation + trésorerie
│   │   │   ├── StatusBar.jsx        # Barre de statut (satisfaction, étoiles ★★★, trésorerie)
│   │   │   ├── OrderCard.jsx        # Carte de commande (timer, VIP badge, ingrédients)
│   │   │   ├── GameOverOverlay.jsx  # Overlay de fin de partie (+ étoiles)
│   │   │   ├── ActivityLog.jsx      # Journal d'activité temps réel
│   │   │   ├── ShopCard.jsx         # Carte d'achat (+ DLC, lots, conservation)
│   │   │   ├── ExperimentPanel.jsx  # Panneau de sélection + expérimentation
│   │   │   ├── DiscoveredRecipes.jsx # Liste des recettes découvertes
│   │   │   ├── StatsGrid.jsx        # Grille de statistiques financières
│   │   │   └── ProfitTable.jsx      # Tableau de bénéfice par plat
│   │   ├── contexts/
│   │   │   └── SocketContext.jsx    # Contexte Socket.io (persistant)
│   │   ├── hooks/
│   │   │   ├── useServiceSocket.js  # Hook Socket.io (+ stars, VIP events)
│   │   │   └── useLabData.js        # Hook données du laboratoire
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx         # Connexion / Inscription
│   │   │   ├── LabPage.jsx          # Marché + Laboratoire
│   │   │   ├── RecipesPage.jsx      # Livre des recettes
│   │   │   ├── ServicePage.jsx      # Service en temps réel
│   │   │   └── DashboardPage.jsx    # Tableau de bord financier
│   │   ├── services/
│   │   │   └── api.js               # Client API (axios + Socket.io factory)
│   │   ├── utils/
│   │   │   ├── chartConfig.js       # Configuration Chart.js
│   │   │   └── serviceHelpers.js    # Helpers du service (couleurs, formatage)
│   │   ├── styles/                  # Fichiers CSS par page (responsive)
│   │   ├── App.jsx                  # Routeur principal + SocketProvider
│   │   ├── main.jsx                 # Point d'entrée React
│   │   └── index.css                # Styles globaux
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🎮 Gameplay

1. **Register / Login** → Créer son restaurant et se connecter
2. **Marché** → Acheter des ingrédients avec sa trésorerie (500 G de départ)
   - Chaque achat crée un **lot FIFO** avec date d'expiration
   - Les ingrédients frais (viande, poisson) périment plus vite
3. **Laboratoire** → Combiner des ingrédients pour découvrir des recettes
   - ✅ Match → Recette débloquée et sauvegardée
   - ❌ Pas de match → Ingrédients perdus
4. **Livre des Recettes** → Consulter toutes les recettes découvertes
5. **Service** → Recevoir et traiter des commandes en temps réel
   - ✅ Servir → Stock consommé en FIFO (lots les plus anciens d'abord), +revenu
   - ❌ Rejeter / Expirée → -10 satisfaction, -15 G
   - ⭐ **Commandes VIP** → prix x3, +5 satisfaction si réussie / -50 G, -15 sat, -1 étoile si ratée
   - 💀 Satisfaction < 0 / Trésorerie ≤ 0 / Étoiles = 0 → Game Over
6. **Dashboard** → Analyser ses finances (graphiques, bénéfice par plat)

---

## 🏗️ Architecture

Le projet suit une architecture **modulaire** :

- **Backend** : séparation nette entre config, controllers, services, socket, cron et routes. La logique de stock (`stockService`) est partagée entre le lab et le service pour éviter la duplication. Le cron de nettoyage tourne en tâche de fond.
- **Frontend** : les pages délèguent leur logique à des **custom hooks** (`useServiceSocket`, `useLabData`) et affichent des **composants réutilisables** extraits (`OrderCard`, `ShopCard`, `StatsGrid`, etc.). Le `SocketContext` maintient la connexion Socket.io au niveau `App`.
- **Docker** : architecture 3 conteneurs (MongoDB, Backend Node.js, Frontend Nginx) orchestrés via docker-compose avec réseau interne.

---

## 👤 Auteurs

Rayan et Alexis

---

## 📝 Notes Techniques

- JWT : expiration 7 jours
- Mots de passe : bcryptjs (salt 10)
- Matching recettes : comparaison insensible à la casse des noms d'ingrédients
- Constantes de jeu centralisées dans `config/constants.js`
- Stock vérifié côté serveur avant chaque service ou expérience
- **FIFO** : les lots les plus anciens sont toujours consommés en premier
- **Cron** : nettoyage automatique des ingrédients périmés (intervalle configurable)
- **VIP** : 20% de chance par commande, timer raccourci à 20s
- **Étoiles** : 3 au départ, perte d'une étoile par commande VIP ratée

---

**Dernière mise à jour** : Février 2026  
**Status** : ✅ Niveau Chef Étoilé (VIP, FIFO/DLC, Docker, Responsive)

---

## 📌 Post-Oral

Après la soutenance orale, j'ai repris le projet pour apporter quelques améliorations :

- **Nettoyage du code** : refactoring de certaines parties du code pour améliorer la lisibilité et la maintenabilité
- **Ajout des commandes VIP** : système de commandes VIP avec prix triplé, bonus/malus de satisfaction et perte d'étoile en cas d'échec
- **Dockerisation** : mise en place de Docker avec docker-compose (3 conteneurs : MongoDB, Backend, Frontend Nginx)
- **Correction de bugs** : résolution de quelques petites erreurs identifiées lors de l'oral et des tests