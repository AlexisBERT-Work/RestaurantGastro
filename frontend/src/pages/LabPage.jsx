import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labService, ingredientStockService, transactionService } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/LabPage.css';

export default function LabPage({ token, onLogout }) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [discoveredRecipes, setDiscoveredRecipes] = useState([]);
  const [treasury, setTreasury] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState({});

  useEffect(() => {
    loadStock();
    loadDiscoveredRecipes();
    loadTreasury();
  }, [token]);

  const loadStock = async () => {
    try {
      const response = await ingredientStockService.getUserStock(token);
      setIngredients(response.data.ingredients || []);
    } catch (err) {
      console.error('Failed to load stock:', err);
    }
  };

  const loadTreasury = async () => {
    try {
      const response = await transactionService.getTreasury(token);
      setTreasury(response.data.treasury);
    } catch (err) {
      console.error('Failed to load treasury:', err);
    }
  };

  const loadDiscoveredRecipes = async () => {
    try {
      const response = await labService.getUserRecipes(token);
      setDiscoveredRecipes(response.data.recipes || []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    }
  };

  const handlePurchase = async (ingredient) => {
    const qty = buyQuantity[ingredient._id] || 1;
    try {
      const response = await ingredientStockService.purchaseIngredient(ingredient._id, qty, token);
      setTreasury(response.data.treasury);
      // Update local stock
      setIngredients(prev => prev.map(ing =>
        ing._id === ingredient._id
          ? { ...ing, quantity: response.data.newQuantity }
          : ing
      ));
      setMessage(`${qty}x ${ingredient.name} achete(s) ! (-${ingredient.cost * qty}G)`);
      setMessageType('success');
      setBuyQuantity(prev => ({ ...prev, [ingredient._id]: 1 }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Erreur lors de l\'achat';
      setMessage(errMsg);
      setMessageType('error');
    }
  };

  const handleIngredientClick = (ingredient) => {
    if (ingredient.quantity <= 0) {
      setMessage(`Stock insuffisant pour ${ingredient.name}. Achetez-en d'abord !`);
      setMessageType('error');
      return;
    }
    setSelectedIngredients(prev => [...prev, ingredient.name]);
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleExperiment = async () => {
    if (selectedIngredients.length === 0) {
      setMessage('Selectionnez au moins un ingredient');
      setMessageType('error');
      return;
    }

    try {
      const response = await labService.experimentAndMatch(selectedIngredients, token);
      setMessage(response.data.message);
      setMessageType(response.data.success ? 'success' : 'error');

      if (response.data.success) {
        setSelectedIngredients([]);
        loadDiscoveredRecipes();
      } else {
        setSelectedIngredients([]);
      }
      // Refresh stock after experiment (ingredients consumed)
      loadStock();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'L\'experience a echoue';
      setMessage(errMsg);
      setMessageType('error');
      // Still refresh stock in case of partial consumption
      loadStock();
    }
  };

  const handleClear = () => {
    setSelectedIngredients([]);
    setMessage('');
  };

  return (
    <div className="lab-container">
      <Navbar token={token} onLogout={onLogout} treasury={treasury} />

      <div className="lab-content">
        {/* Shop Section */}
        <div className="shop-section">
          <h2>Marche aux ingredients</h2>
          <div className="shop-grid">
            {ingredients.map((ing) => (
              <div key={ing._id} className="shop-card">
                <div className="shop-card-header">
                  <span className="shop-item-name">{ing.name}</span>
                  <span className="shop-item-category">{ing.category}</span>
                </div>
                <div className="shop-card-body">
                  <div className="shop-info">
                    <span className="shop-cost">{ing.cost}G</span>
                    <span className="shop-stock">Stock: {ing.quantity}</span>
                  </div>
                  <div className="shop-actions">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={buyQuantity[ing._id] || 1}
                      onChange={(e) => setBuyQuantity(prev => ({
                        ...prev,
                        [ing._id]: Math.max(1, parseInt(e.target.value) || 1)
                      }))}
                      className="qty-input"
                    />
                    <button
                      onClick={() => handlePurchase(ing)}
                      className="btn-buy"
                      disabled={treasury !== null && treasury < ing.cost * (buyQuantity[ing._id] || 1)}
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients to experiment */}
        <div className="ingredients-section">
          <h2>Ingredients disponibles</h2>
          <div className="ingredients-grid">
            {ingredients.map((ing) => (
              <button
                key={ing._id}
                className={`ingredient-card ${ing.quantity <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => handleIngredientClick(ing)}
                title={ing.description}
                disabled={ing.quantity <= 0}
              >
                <span className="ing-name">{ing.name}</span>
                <span className="stock-badge">{ing.quantity}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="experiment-section">
          <h2>Melange actuel</h2>
          <div className="selected-ingredients">
            {selectedIngredients.length === 0 ? (
              <p className="empty-state">Cliquez sur les ingredients pour les ajouter...</p>
            ) : (
              selectedIngredients.map((ing, idx) => (
                <div key={idx} className="ingredient-tag">
                  {ing}
                  <button onClick={() => handleRemoveIngredient(idx)}>x</button>
                </div>
              ))
            )}
          </div>

          <div className="experiment-buttons">
            <button onClick={handleExperiment} className="btn-experiment">
              Experimenter
            </button>
            <button onClick={handleClear} className="btn-clear">
              Effacer
            </button>
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>

        {discoveredRecipes.length > 0 && (
          <div className="discovered-section">
            <h2>Recettes decouvertes ({discoveredRecipes.length})</h2>
            <div className="recipes-list">
              {discoveredRecipes.map((recipe) => (
                <div key={recipe._id} className="recipe-card">
                  <h3>{recipe.name}</h3>
                  <p>{recipe.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
