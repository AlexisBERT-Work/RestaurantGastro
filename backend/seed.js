const mongoose = require('mongoose');
require('dotenv').config();

const Recipe = require('./models/Recipe');
const Ingredient = require('./models/Ingredient');

// Seed data
const ingredientsData = [
  { name: 'Tomato', category: 'vegetable', description: 'Fresh red tomato' },
  { name: 'Basil', category: 'spice', description: 'Italian basil' },
  { name: 'Mozzarella', category: 'cheese', description: 'Fresh mozzarella cheese' },
  { name: 'Olive Oil', category: 'sauce', description: 'Extra virgin olive oil' },
  { name: 'Chicken', category: 'meat', description: 'Fresh chicken breast' },
  { name: 'Garlic', category: 'vegetable', description: 'Fresh garlic cloves' },
  { name: 'Onion', category: 'vegetable', description: 'Yellow onion' },
  { name: 'Pasta', category: 'other', description: 'Italian pasta' },
  { name: 'Salt', category: 'spice', description: 'Sea salt' },
  { name: 'Pepper', category: 'spice', description: 'Black pepper powder' },
  { name: 'Butter', category: 'other', description: 'Unsalted butter' },
  { name: 'Cream', category: 'sauce', description: 'Heavy cream' },
  { name: 'Beef', category: 'meat', description: 'Ground beef' },
  { name: 'Flour', category: 'other', description: 'All-purpose flour' },
  { name: 'Parmesan', category: 'cheese', description: 'Parmesan cheese' }
];

const recipesData = [
  {
    name: 'Caprese Salad',
    requiredIngredients: [
      { name: 'Tomato', quantity: 3 },
      { name: 'Mozzarella', quantity: 1 },
      { name: 'Basil', quantity: 5 },
      { name: 'Olive Oil', quantity: 2 }
    ],
    description: 'A classic Italian fresh salad',
    difficulty: 'easy'
  },
  {
    name: 'Spaghetti Carbonara',
    requiredIngredients: [
      { name: 'Pasta', quantity: 400 },
      { name: 'Cream', quantity: 200 },
      { name: 'Parmesan', quantity: 100 },
      { name: 'Salt', quantity: 1 },
      { name: 'Pepper', quantity: 1 }
    ],
    description: 'Creamy Roman pasta dish',
    difficulty: 'medium'
  },
  {
    name: 'Garlic Chicken',
    requiredIngredients: [
      { name: 'Chicken', quantity: 1 },
      { name: 'Garlic', quantity: 4 },
      { name: 'Olive Oil', quantity: 3 },
      { name: 'Salt', quantity: 1 },
      { name: 'Pepper', quantity: 1 }
    ],
    description: 'Delicious roasted chicken with garlic',
    difficulty: 'easy'
  },
  {
    name: 'Beef Burger',
    requiredIngredients: [
      { name: 'Beef', quantity: 200 },
      { name: 'Onion', quantity: 1 },
      { name: 'Salt', quantity: 1 },
      { name: 'Pepper', quantity: 1 }
    ],
    description: 'Juicy homemade burger',
    difficulty: 'easy'
  },
  {
    name: 'Creamy Mushroom Pasta',
    requiredIngredients: [
      { name: 'Pasta', quantity: 400 },
      { name: 'Cream', quantity: 200 },
      { name: 'Butter', quantity: 50 },
      { name: 'Garlic', quantity: 2 }
    ],
    description: 'Rich creamy pasta with a savory taste',
    difficulty: 'medium'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert ingredients
    const ingredients = await Ingredient.insertMany(ingredientsData);
    console.log(`✅ ${ingredients.length} ingredients created`);

    // Insert recipes
    const recipes = await Recipe.insertMany(recipesData);
    console.log(`✅ ${recipes.length} recipes created`);

    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
