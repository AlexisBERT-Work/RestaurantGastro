const mongoose = require('mongoose');
require('dotenv').config();

const Recipe = require('./models/Recipe');
const Ingredient = require('./models/Ingredient');
const UserIngredient = require('./models/UserIngredient');

// Donnees d'initialisation avec duree de vie (shelfLife en heures)
const ingredientsData = [
  { name: 'Tomate', category: 'legume', description: 'Tomate rouge fraiche', cost: 5, shelfLife: 2 },
  { name: 'Basilic', category: 'epice', description: 'Basilic italien', cost: 3, shelfLife: 4 },
  { name: 'Mozzarella', category: 'fromage', description: 'Mozzarella fraiche', cost: 12, shelfLife: 2 },
  { name: 'Huile d\'olive', category: 'sauce', description: 'Huile d\'olive extra vierge', cost: 8, shelfLife: 8 },
  { name: 'Poulet', category: 'viande', description: 'Blanc de poulet frais', cost: 15, shelfLife: 1 },
  { name: 'Ail', category: 'legume', description: 'Gousses d\'ail fraiches', cost: 3, shelfLife: 5 },
  { name: 'Oignon', category: 'legume', description: 'Oignon jaune', cost: 4, shelfLife: 5 },
  { name: 'Pates', category: 'autre', description: 'Pates italiennes', cost: 6, shelfLife: 10 },
  { name: 'Sel', category: 'epice', description: 'Sel de mer', cost: 2, shelfLife: 24 },
  { name: 'Poivre', category: 'epice', description: 'Poivre noir moulu', cost: 3, shelfLife: 24 },
  { name: 'Beurre', category: 'autre', description: 'Beurre doux', cost: 7, shelfLife: 3 },
  { name: 'Creme', category: 'sauce', description: 'Creme epaisse', cost: 10, shelfLife: 2 },
  { name: 'Boeuf', category: 'viande', description: 'Boeuf hache', cost: 20, shelfLife: 1 },
  { name: 'Farine', category: 'autre', description: 'Farine tout usage', cost: 4, shelfLife: 12 },
  { name: 'Parmesan', category: 'fromage', description: 'Fromage parmesan', cost: 15, shelfLife: 6 },
  { name: 'Saumon', category: 'viande', description: 'Filet de saumon frais', cost: 25, shelfLife: 1 },
  { name: 'Citron', category: 'legume', description: 'Citron jaune', cost: 3, shelfLife: 4 },
  { name: 'Champignon', category: 'legume', description: 'Champignons de Paris', cost: 6, shelfLife: 2 },
  { name: 'Riz', category: 'autre', description: 'Riz basmati', cost: 5, shelfLife: 12 },
  { name: 'Truffe', category: 'epice', description: 'Truffe noire du Perigord', cost: 50, shelfLife: 1 }
];

const recipesData = [
  {
    name: 'Salade Caprese',
    requiredIngredients: [
      { name: 'Tomate', quantity: 2 },
      { name: 'Mozzarella', quantity: 1 },
      { name: 'Basilic', quantity: 1 },
      { name: 'Huile d\'olive', quantity: 1 }
    ],
    description: 'Une salade fraiche italienne classique',
    difficulty: 'facile',
    price: 35
  },
  {
    name: 'Spaghetti Carbonara',
    requiredIngredients: [
      { name: 'Pates', quantity: 2 },
      { name: 'Creme', quantity: 1 },
      { name: 'Parmesan', quantity: 1 },
      { name: 'Sel', quantity: 1 },
      { name: 'Poivre', quantity: 1 }
    ],
    description: 'Plat de pates cremeuses a la romaine',
    difficulty: 'moyen',
    price: 55
  },
  {
    name: 'Poulet a l\'ail',
    requiredIngredients: [
      { name: 'Poulet', quantity: 1 },
      { name: 'Ail', quantity: 2 },
      { name: 'Huile d\'olive', quantity: 1 },
      { name: 'Sel', quantity: 1 },
      { name: 'Poivre', quantity: 1 }
    ],
    description: 'Delicieux poulet roti a l\'ail',
    difficulty: 'facile',
    price: 45
  },
  {
    name: 'Burger au boeuf',
    requiredIngredients: [
      { name: 'Boeuf', quantity: 1 },
      { name: 'Oignon', quantity: 1 },
      { name: 'Sel', quantity: 1 },
      { name: 'Poivre', quantity: 1 }
    ],
    description: 'Burger maison juteux',
    difficulty: 'facile',
    price: 40
  },
  {
    name: 'Pates aux champignons a la creme',
    requiredIngredients: [
      { name: 'Pates', quantity: 2 },
      { name: 'Creme', quantity: 1 },
      { name: 'Beurre', quantity: 1 },
      { name: 'Champignon', quantity: 2 }
    ],
    description: 'Pates cremeuses au gout savoureux',
    difficulty: 'moyen',
    price: 50
  },
  {
    name: 'Saumon grille au citron',
    requiredIngredients: [
      { name: 'Saumon', quantity: 1 },
      { name: 'Citron', quantity: 1 },
      { name: 'Beurre', quantity: 1 },
      { name: 'Sel', quantity: 1 }
    ],
    description: 'Filet de saumon grille avec beurre au citron',
    difficulty: 'moyen',
    price: 65
  },
  {
    name: 'Risotto aux champignons',
    requiredIngredients: [
      { name: 'Riz', quantity: 2 },
      { name: 'Champignon', quantity: 2 },
      { name: 'Beurre', quantity: 1 },
      { name: 'Parmesan', quantity: 1 },
      { name: 'Oignon', quantity: 1 }
    ],
    description: 'Risotto crémeux aux champignons et parmesan',
    difficulty: 'difficile',
    price: 70
  },
  {
    name: 'Risotto a la truffe',
    requiredIngredients: [
      { name: 'Riz', quantity: 2 },
      { name: 'Truffe', quantity: 1 },
      { name: 'Beurre', quantity: 1 },
      { name: 'Parmesan', quantity: 1 },
      { name: 'Creme', quantity: 1 }
    ],
    description: 'Risotto luxueux a la truffe noire - plat signature',
    difficulty: 'difficile',
    price: 120
  }
];

const seedDatabase = async () => {
  try {
    console.log('[INFO] Connexion a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[OK] MongoDB connecte');

    // Nettoie les donnees existantes
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    await UserIngredient.deleteMany({});
    console.log('[INFO] Donnees existantes supprimees');

    // Insere les ingredients
    const ingredients = await Ingredient.insertMany(ingredientsData);
    console.log(`[OK] ${ingredients.length} ingredients crees`);

    // Insere les recettes
    const recipes = await Recipe.insertMany(recipesData);
    console.log(`[OK] ${recipes.length} recettes creees`);

    console.log('[OK] Base de donnees initialisee avec succes !');
    process.exit(0);
  } catch (err) {
    console.error('[ERREUR] Erreur d\'initialisation:', err);
    process.exit(1);
  }
};

seedDatabase();
