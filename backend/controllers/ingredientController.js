const Ingredient = require('../models/Ingredient');

exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json({ ingredients });
  } catch (err) {
    console.error('Erreur de recuperation des ingredients:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addIngredient = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nom de l\'ingredient requis' });
    }

    const ingredient = new Ingredient({
      name,
      category: category || 'other',
      description: description || ''
    });

    await ingredient.save();

    res.status(201).json({
      message: 'Ingredient ajoute',
      ingredient
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'ingredient:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
