# GastroChef - Architecture & DDC

## 📊 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ Auth Page   │  │  Lab Page   │  │  Recipes Page        │    │
│  │ - Register  │  │ - Experiment│  │ - View Discovered    │    │
│  │ - Login     │  │ - Match Ing │  │ - See Details        │    │
│  └─────────────┘  └─────────────┘  └──────────────────────┘    │
│         │                │                      │                │
│         └────────────────┼──────────────────────┘                │
│                          │ (HTTP + JWT)                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER (Express + Node.js)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Routes                                                │ │
│  │  - POST   /api/auth/register                              │ │
│  │  - POST   /api/auth/login                                 │ │
│  │  - POST   /api/lab/experiment      [Protected]            │ │
│  │  - GET    /api/lab/recipes/all     [Protected]            │ │
│  │  - GET    /api/lab/recipes/my      [Protected]            │ │
│  │  - GET    /api/recipes             [Protected]            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                       │
│  ┌────────────────────────┼───────────────────────────────────┐ │
│  │  Controllers           │                                    │ │
│  │  - authController      │                                    │ │
│  │  - labController       │                                    │ │
│  │  - ingredientController│                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│         ▲                     ▲                                   │
│         │                     │                                   │
│  ┌──────┴──────────────┬──────┴───────────────────────────────┐ │
│  │  Models / Schemas   │                                       │ │
│  │  - User             │  - Middleware                         │ │
│  │  - Recipe           │  - Auth (JWT verify)                  │ │
│  │  - Ingredient       │  - Error Handling                     │ │
│  │  - UserRecipe       │                                       │ │
│  └─────────────────────┴───────────────────────────────────────┘ │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐    │
│  │ Users    │  │ Recipes  │  │ Ingrednt │  │ UserRecipes │    │
│  │ ---------│  │ -------  │  │ --------│  │ ----------- │    │
│  │ _id      │  │ _id      │  │ _id     │  │ _id         │    │
│  │ email    │  │ name     │  │ name    │  │ userId      │    │
│  │ password │  │ required │  │ category│  │ recipeId    │    │
│  │ restName │  │ ingrednt │  │ descrip │  │ discovered  │    │
│  │ createdAt│  │ descrip  │  │ created │  │ discoveredAt│    │
│  │          │  │ difficulty  │ At      │  │             │    │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow: Expérimentation & Découverte Recette

```
┌──────────────────────────────────────────┐
│  User selects ingredients in Lab         │
│  ex: [Tomato, Mozzarella, Basil, Oil]  │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  POST /api/lab/experiment                │
│  { combinedIngredients: [...] }          │
│  (with JWT token)                        │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  labController.experimentAndMatch()      │
│  - Extract userId from token             │
│  - Get all recipes from DB               │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  MATCHING ALGORITHM                      │
│  For each recipe:                        │
│  - requiredING = [Tomato, Mozzarella,   │
│                   Basil, Olive Oil]      │
│  - Check if ALL requiredING in combined │
│  - If YES → Match found!                │
│  - If NO  → Continue to next recipe     │
└────────────┬─────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
   MATCH        NO MATCH
      │             │
      ▼             ▼
┌──────────────┐  ┌──────────────────┐
│ Update DB    │  │ Return failure   │
│ - Insert in  │  │ msg: "Invalid    │
│   UserRecipe │  │ combination.     │
│   discovered:│  │ Ingredients      │
│   true       │  │ destroyed!"      │
│ - Return     │  └──────────────────┘
│   success +  │
│   recipe     │
└──────────────┘
```

---

## 🗄️ Schéma de Données (MongoDB)

### Collections

#### 1. **users**
```javascript
{
  _id: ObjectId,
  restaurantName: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  createdAt: Timestamp
}
```

#### 2. **recipes**
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  requiredIngredients: [
    {
      name: String,
      quantity: Number
    }
  ],
  difficulty: String (enum: easy|medium|hard),
  createdAt: Timestamp
}
```

#### 3. **ingredients**
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  category: String (enum: vegetable|meat|cheese|spice|sauce|other),
  description: String,
  createdAt: Timestamp
}
```

#### 4. **userrecipes** (Relation User ↔️ Recipe)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  recipeId: ObjectId (ref: recipes),
  discovered: Boolean (default: false),
  discoveredAt: Timestamp | null,
  unique_index: [userId, recipeId]
}
```

---

## 🔐 Authentification & Sécurité

### JWT Flow
```
1. User registers/logs in
   └─ email + password sent

2. Server validates
   └─ Password matched & hashed

3. JWT Generated
   Payload: { id: user._id }
   Secret: process.env.JWT_SECRET
   Expiry: 7 days

4. Client stores token (localStorage)
   └─ Sent in Authorization header

5. Protected routes verify token
   └─ Middleware: authMiddleware
   └─ If invalid → 403 Forbidden
```

### Password Security
- Hashing: **bcryptjs** (salt: 10 rounds)
- Never store plaintext passwords
- Comparison with `bcryptjs.compare()`

---

## 📡 API Endpoints Summary

| Method | Endpoint | Protected | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login & get JWT |
| POST | `/api/lab/experiment` | ✅ | Test ingredient combo |
| GET | `/api/lab/recipes/all` | ✅ | See all recipes |
| GET | `/api/lab/recipes/my` | ✅ | User's discovered recipes |
| GET | `/api/recipes` | ✅ | List available ingredients |
| POST | `/api/recipes` | ✅ | Add new ingredient (future) |

---

## 🚀 Technologies & Versions

| Tech | Version | Purpose |
|------|---------|---------|
| Node.js | 16+ | Runtime |
| Express | 4.18 | Backend framework |
| MongoDB | 5+ | Database |
| Mongoose | 7+ | ODM |
| React | 18 | Frontend framework |
| Vite | 4.3 | Build tool |
| JWT | 9+ | Token-based auth |
| bcryptjs | 2.4 | Password hashing |
| Socket.io | 4.6 | Real-time comm (future) |

---

## 📈 Game Loop (MVP)

```
┌─► [LOGIN/REGISTER]
│   ↓
│   [LAB PAGE]
│   - Display available ingredients
│   - User selects ingredients
│   - Click "Experiment"
│   ↓
│   [MATCH CHECK]
│   ├─ SUCCESS → Save recipe → [LAB PAGE]
│   └─ FAILURE → Discard ingredients → [LAB PAGE]
│   ↓
│   [RECIPE PAGE]
│   - View all discovered recipes
│   - See ingredients & difficulty
│
└─ LOOP (user discovers more recipes)
```

---

## 🎯 Next Steps (Niveau 11-20)

### Phase 2: Economy System
- [ ] Initial budget (€1000)
- [ ] Marketplace: Buy ingredients (€price per unit)
- [ ] Stock management (inventory)
- [ ] Expense tracking

### Phase 3: Service (Real-time)
- [ ] Socket.io server events
- [ ] Orders stream (random customers)
- [ ] Prepare & serve dishes
- [ ] Revenue calculation
- [ ] Game Over condition (budget < 0)

### Phase 4: Polish & Deployment
- [ ] Unit tests (Jest)
- [ ] E2E tests (Cypress)
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Hosting (Heroku, Render, Vercel)

---

**Document créé**: Février 2026  
**MVP Status**: ✅ Architecture complète pour Niveau 10/20
