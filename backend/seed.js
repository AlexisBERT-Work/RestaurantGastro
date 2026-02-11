const mongoose = require('mongoose');
require('dotenv').config();

const Recipe = require('./models/Recipe');
const Ingredient = require('./models/Ingredient');
const UserIngredient = require('./models/UserIngredient');

// Seed data
const ingredientsData = [
  { name: 'Tomate', category: 'legume', description: 'Tomate rouge fraiche', cost: 5 },
  { name: 'Basilic', category: 'epice', description: 'Basilic italien', cost: 3 },
  { name: 'Mozzarella', category: 'fromage', description: 'Mozzarella fraiche', cost: 12 },
  { name: 'Huile d\'olive', category: 'sauce', description: 'Huile d\'olive extra vierge', cost: 8 },
  { name: 'Poulet', category: 'viande', description: 'Blanc de poulet frais', cost: 15 },
  { name: 'Ail', category: 'legume', description: 'Gousses d\'ail fraiches', cost: 3 },
  { name: 'Oignon', category: 'legume', description: 'Oignon jaune', cost: 4 },
  { name: 'Pates', category: 'autre', description: 'Pates italiennes', cost: 6 },
  { name: 'Sel', category: 'epice', description: 'Sel de mer', cost: 2 },
  { name: 'Poivre', category: 'epice', description: 'Poivre noir moulu', cost: 3 },
  { name: 'Beurre', category: 'autre', description: 'Beurre doux', cost: 7 },
  { name: 'Creme', category: 'sauce', description: 'Creme epaisse', cost: 10 },
  { name: 'Boeuf', category: 'viande', description: 'Boeuf hache', cost: 20 },
  { name: 'Farine', category: 'autre', description: 'Farine tout usage', cost: 4 },
  { name: 'Parmesan', category: 'fromage', description: 'Fromage parmesan', cost: 15 }
];

const recipesData = [
  {
    name: 'Salade Caprese',
    requiredIngredients: [
      { name: 'Tomate', quantity: 3 },
      { name: 'Mozzarella', quantity: 1 },
      { name: 'Basilic', quantity: 5 },
      { name: 'Huile d\'olive', quantity: 2 }
    ],
    description: 'Une salade fraiche italienne classique',
    difficulty: 'facile',
    price: 35
  },
  {
    name: 'Spaghetti Carbonara',
    requiredIngredients: [
      { name: 'Pates', quantity: 400 },
      { name: 'Creme', quantity: 200 },
      { name: 'Parmesan', quantity: 100 },
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
      { name: 'Ail', quantity: 4 },
      { name: 'Huile d\'olive', quantity: 3 },
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
      { name: 'Boeuf', quantity: 200 },
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
      { name: 'Pates', quantity: 400 },
      { name: 'Creme', quantity: 200 },
      { name: 'Beurre', quantity: 50 },
      { name: 'Ail', quantity: 2 }
    ],
    description: 'Pates cremeuses au gout savoureux',
    difficulty: 'moyen',
    price: 50
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

    // Clear existing data
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    await UserIngredient.deleteMany({});
    console.log('[INFO] Donnees existantes supprimees');

    // Insert ingredients
    const ingredients = await Ingredient.insertMany(ingredientsData);
    console.log(`[OK] ${ingredients.length} ingredients crees`);

    // Insert recipes
    const recipes = await Recipe.insertMany(recipesData);
    console.log(`[OK] ${recipes.length} recettes creees`);

    console.log('[OK] Base de donnees initialisee avec succes !');
    process.exit(0);
  } catch (err) {
    console.error('[ERREUR] Erreur de seed:', err);
    process.exit(1);
  }
};

seedDatabase();
