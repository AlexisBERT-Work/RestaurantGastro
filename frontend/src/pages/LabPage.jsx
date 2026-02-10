import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labService } from '../services/api';
import '../styles/LabPage.css';

export default function LabPage({ token, onLogout }) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [message, setMessage] = useState('');
  const [discoveredRecipes, setDiscoveredRecipes] = useState([]);

  useEffect(() => {
    loadIngredients();
    loadDiscoveredRecipes();
  }, [token]);

  const loadIngredients = async () => {
    try {
      const response = await labService.getAllIngredients(token);
      setIngredients(response.data.ingredients || []);
    } catch (err) {
      console.error('Failed to load ingredients:', err);
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

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredients(prev => [...prev, ingredient.name]);
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleExperiment = async () => {
    if (selectedIngredients.length === 0) {
      setMessage('Selectionnez au moins un ingredient');
      return;
    }

    try {
      const response = await labService.experimentAndMatch(selectedIngredients, token);
      setMessage(response.data.message);
      
      if (response.data.success) {
        setSelectedIngredients([]);
        loadDiscoveredRecipes();
      }
    } catch (err) {
      setMessage('L\'experience a echoue');
    }
  };

  const handleClear = () => {
    setSelectedIngredients([]);
    setMessage('');
  };

  return (
    <div className="lab-container">
      <header className="lab-header">
        <h1>Le Laboratoire - Decouvrir des Recettes</h1>
        <div className="header-actions">
          <Link to="/service" className="nav-button">Service</Link>
          <Link to="/recipes" className="nav-button">Mes Recettes</Link>
          <button onClick={onLogout} className="logout-btn">Deconnexion</button>
        </div>
      </header>

      <div className="lab-content">
        <div className="ingredients-section">
          <h2>Ingredients disponibles</h2>
          <div className="ingredients-grid">
            {ingredients.map((ing) => (
              <button
                key={ing._id}
                className="ingredient-card"
                onClick={() => handleIngredientClick(ing)}
                title={ing.description}
              >
                {ing.name}
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
                  <button onClick={() => handleRemoveIngredient(idx)}>×</button>
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
            <div className={`message ${message.includes('Recette decouverte') ? 'success' : 'error'}`}>
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
