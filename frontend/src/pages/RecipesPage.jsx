import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labService } from '../services/api';
import '../styles/RecipesPage.css';

export default function RecipesPage({ token, onLogout }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, [token]);

  const loadRecipes = async () => {
    try {
      const response = await labService.getUserRecipes(token);
      setRecipes(response.data.recipes || []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipes-container">
      <header className="recipes-header">
        <h1>Mon Livre de Recettes</h1>
        <div className="header-actions">
          <Link to="/lab" className="nav-button">Laboratoire</Link>
          <Link to="/service" className="nav-button">Service</Link>
          <button onClick={onLogout} className="logout-btn">Deconnexion</button>
        </div>
      </header>

      <div className="recipes-content">
        {loading ? (
          <p className="loading">Chargement des recettes...</p>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <p>Aucune recette decouverte pour le moment !</p>
            <p>Allez au <Link to="/lab">laboratoire</Link> pour experimenter et decouvrir des recettes.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="recipe-item">
                <h3>{recipe.name}</h3>
                <p className="description">{recipe.description}</p>
                <div className="difficulty">
                  <span>Difficulte : <strong>{recipe.difficulty}</strong></span>
                </div>
                <div className="ingredients">
                  <h4>Ingredients :</h4>
                  <ul>
                    {recipe.requiredIngredients.map((ing, idx) => (
                      <li key={idx}>{ing.name} x{ing.quantity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
