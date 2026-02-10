const Ingredient = require('../models/Ingredient');

exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json({ ingredients });
  } catch (err) {
    console.error('Get ingredients Error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
};

exports.addIngredient = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: '❌ Ingredient name required' });
    }

    const ingredient = new Ingredient({
      name,
      category: category || 'other',
      description: description || ''
    });

    await ingredient.save();

    res.status(201).json({
      message: '✅ Ingredient added',
      ingredient
    });
  } catch (err) {
    console.error('Add ingredient Error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
};
