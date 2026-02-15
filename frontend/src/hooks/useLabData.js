import { useState, useEffect, useCallback } from 'react';
import { labService, ingredientStockService, transactionService } from '../services/api';

export default function useLabData(token) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [discoveredRecipes, setDiscoveredRecipes] = useState([]);
  const [treasury, setTreasury] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const loadStock = useCallback(async () => {
    try {
      const res = await ingredientStockService.getUserStock(token);
      setIngredients(res.data.ingredients || []);
    } catch (err) {
      console.error('Echec du chargement du stock:', err);
    }
  }, [token]);

  const loadTreasury = useCallback(async () => {
    try {
      const res = await transactionService.getTreasury(token);
      setTreasury(res.data.treasury);
    } catch (err) {
      console.error('Echec du chargement de la tresorerie:', err);
    }
  }, [token]);

  const loadDiscoveredRecipes = useCallback(async () => {
    try {
      const res = await labService.getUserRecipes(token);
      setDiscoveredRecipes(res.data.recipes || []);
    } catch (err) {
      console.error('Echec du chargement des recettes:', err);
    }
  }, [token]);

  useEffect(() => {
    loadStock();
    loadDiscoveredRecipes();
    loadTreasury();
  }, [loadStock, loadDiscoveredRecipes, loadTreasury]);

  // Acheter un ingredient
  const purchaseIngredient = async (ingredient, qty) => {
    try {
      const res = await ingredientStockService.purchaseIngredient(ingredient._id, qty, token);
      setTreasury(res.data.treasury);
      setIngredients(prev => prev.map(ing =>
        ing._id === ingredient._id
          ? { ...ing, quantity: res.data.newQuantity }
          : ing
      ));
      setMessage(`${qty}x ${ingredient.name} achete(s) ! (-${ingredient.cost * qty}G)`);
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'achat");
      setMessageType('error');
    }
  };

  // Selection d'ingredient pour l'experience
  const addIngredient = (ingredient) => {
    if (ingredient.quantity <= 0) {
      setMessage(`Stock insuffisant pour ${ingredient.name}. Achetez-en d'abord !`);
      setMessageType('error');
      return;
    }
    setSelectedIngredients(prev => [...prev, ingredient.name]);
  };

  const removeIngredient = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
    setMessage('');
  };

  // Lancer l'experience
  const experiment = async () => {
    if (selectedIngredients.length === 0) {
      setMessage('Selectionnez au moins un ingredient');
      setMessageType('error');
      return;
    }

    try {
      const res = await labService.experimentAndMatch(selectedIngredients, token);
      setMessage(res.data.message);
      setMessageType(res.data.success ? 'success' : 'error');
      setSelectedIngredients([]);
      if (res.data.success) loadDiscoveredRecipes();
      loadStock();
    } catch (err) {
      setMessage(err.response?.data?.message || "L'experience a echoue");
      setMessageType('error');
      loadStock();
    }
  };

  return {
    ingredients,
    selectedIngredients,
    discoveredRecipes,
    treasury,
    message,
    messageType,
    purchaseIngredient,
    addIngredient,
    removeIngredient,
    clearSelection,
    experiment
  };
}
