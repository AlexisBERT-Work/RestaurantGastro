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
        <h1>📖 My Recipe Book</h1>
        <div className="header-actions">
          <Link to="/lab" className="nav-button">🔬 Back to Lab</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="recipes-content">
        {loading ? (
          <p className="loading">⏳ Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <p>No recipes discovered yet!</p>
            <p>Go to the <Link to="/lab">lab</Link> to experiment and discover recipes.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="recipe-item">
                <h3>{recipe.name}</h3>
                <p className="description">{recipe.description}</p>
                <div className="difficulty">
                  <span>Difficulty: <strong>{recipe.difficulty}</strong></span>
                </div>
                <div className="ingredients">
                  <h4>Ingredients:</h4>
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
