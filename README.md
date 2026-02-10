# 🍽️ GastroChef - The Lost Menu

## 📋 Projet B3 Fullstack - Gestion de Ghost Kitchen

Un jeu interactif fullstack où vous jouez un restaurateur reprenant un établissement légendaire sans le livre de recettes !

### Stack Technique
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Auth**: JWT

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js (v16+)
- MongoDB (local ou Atlas)
- npm ou yarn

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Configurer `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gastro-chef
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Lancer le serveur:
```bash
npm run dev
```

✅ Serveur accessible sur `http://localhost:5000`

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Lancer le dev server:
```bash
npm run dev
```

✅ Application accessible sur `http://localhost:5173`

---

## 📋 Fonctionnalités Implémentées (MVP - Niveau 10/20)

### ✅ Phase 1 - Authentification (JWT)
- ✓ Page de Register/Login
- ✓ Hashage de password (bcryptjs)
- ✓ Génération de token JWT
- ✓ Protection des routes (middleware auth)
- ✓ Persistance des données utilisateur

### ✅ Phase 2 - Le Laboratoire (Core Gameplay)
- ✓ Interface pour ajouter des ingrédients (UI drag-friendly)
- ✓ Algorithme de matching Ingrédients ↔️ Recettes
- ✓ Succès: Ingrédients valides → Recette débloquée
- ✓ Échec: Combinaison invalide → Ingrédients détruits
- ✓ Sauvegarde des recettes découvertes en base MongoDB

### ✅ Phase 3 - Livre des Recettes
- ✓ Page récapitulatif des recettes découvertes
- ✓ Détails: Ingrédients requis, difficulté, description
- ✓ Affichage élégant en grid responsive

---

## 📊 Architecture & Modèles Données

### Modèles MongoDB

**User**
```javascript
{
  restaurantName: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

**Recipe**
```javascript
{
  name: String,
  requiredIngredients: [{ name: String, quantity: Number }],
  description: String,
  difficulty: enum('easy', 'medium', 'hard'),
  createdAt: Date
}
```

**Ingredient**
```javascript
{
  name: String (unique),
  category: enum('vegetable', 'meat', 'cheese', 'spice', 'sauce', 'other'),
  description: String,
  createdAt: Date
}
```

**UserRecipe**
```javascript
{
  userId: ObjectId (ref User),
  recipeId: ObjectId (ref Recipe),
  discovered: Boolean,
  discoveredAt: Date
}
```

---

## 🔧 API Endpoints

### Auth
```
POST   /api/auth/register        - Créer un compte
POST   /api/auth/login           - Se connecter (retourne JWT)
```

### Lab (Protected)
```
POST   /api/lab/experiment       - Tester une combinaison
GET    /api/lab/recipes/all      - Voir toutes les recettes
GET    /api/lab/recipes/my       - Voir mes recettes découvertes
```

### Recipes (Protected)
```
GET    /api/recipes              - Lister les ingrédients
POST   /api/recipes              - Ajouter un ingrédient (admin)
```

---

## 📁 Structure du Projet

```
gastro-chef/
├── backend/
│   ├── models/              # Schémas MongoDB
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   ├── Ingredient.js
│   │   └── UserRecipe.js
│   ├── routes/              # Endpoints API
│   │   ├── auth.js
│   │   ├── lab.js
│   │   └── recipes.js
│   ├── controllers/         # Logique métier
│   │   ├── authController.js
│   │   ├── labController.js
│   │   └── ingredientController.js
│   ├── middleware/          # Auth & custom
│   │   └── auth.js
│   ├── server.js            # Entrée app
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── AuthPage.jsx
│   │   │   ├── LabPage.jsx
│   │   │   └── RecipesPage.jsx
│   │   ├── components/      # Reusable components (future)
│   │   ├── services/        # API calls
│   │   │   └── api.js
│   │   ├── styles/          # CSS styling
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🎮 Gameplay Flow

1. **Register/Login** → Créer son restaurant et se connecter
2. **Lab Discovery** → Combiner des ingrédients disponibles
3. **Algo Matching** → Vérifier si la combinaison correspond à une recette
   - ✅ Match → Recette débloquée, sauvegardée en DB
   - ❌ No Match → Ingrédients perdus
4. **Recipe Book** → Consulter toutes les recettes découvertes

---

## 🚀 Améliorations Futures (Niveau 12-20)

- [ ] **Économie**: Budget initial, achat ingrédients, gain par service
- [ ] **Service (Temps Réel)**: Socket.io pour les commandes live
- [ ] **Marketplace**: Interface d'achat d'ingrédients
- [ ] **Stock Management**: Quantités, gestion inventaire
- [ ] **Game Over**: Trésorerie < 0
- [ ] **Difficulty Levels**: Easy/Normal/Hard recipes
- [ ] **Drag & Drop UI**: Interface plus immersive pour le lab
- [ ] **Animations**: Transitions, feedback visuels
- [ ] **Tests**: Jest (backend+frontend)
- [ ] **Deployment**: Docker, CI/CD

---

## 👤 Auteur
Projet créé pour le Projet B3 Fullstack - Sup de Vinci

---

## 📝 Notes de Développement

- JWT expiration: 7 jours
- Passwords: Hachés avec bcryptjs (salt: 10)
- Algo matching: Comparaison simple des noms d'ingrédients (lowercase)
- DB: Indexes sur userId+recipeId pour les doublons

---

**Last Updated**: Février 2026  
**MVP Status**: ✅ Niveau 10/20 Complété
