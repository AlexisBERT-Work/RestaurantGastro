import useLabData from '../hooks/useLabData';
import Navbar from '../components/Navbar';
import ShopCard from '../components/ShopCard';
import ExperimentPanel from '../components/ExperimentPanel';
import DiscoveredRecipes from '../components/DiscoveredRecipes';
import '../styles/LabPage.css';

export default function LabPage({ token, onLogout }) {
  const {
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
  } = useLabData(token);

  return (
    <div className="lab-container">
      <Navbar token={token} onLogout={onLogout} treasury={treasury} />

      <div className="lab-content">
        {/* Section boutique */}
        <div className="shop-section">
          <h2>Marche aux ingredients</h2>
          <div className="shop-grid">
            {ingredients.map((ing) => (
              <ShopCard
                key={ing._id}
                ingredient={ing}
                treasury={treasury}
                onPurchase={purchaseIngredient}
              />
            ))}
          </div>
        </div>

        <ExperimentPanel
          ingredients={ingredients}
          selectedIngredients={selectedIngredients}
          message={message}
          messageType={messageType}
          onIngredientClick={addIngredient}
          onRemoveIngredient={removeIngredient}
          onExperiment={experiment}
          onClear={clearSelection}
        />

        <DiscoveredRecipes recipes={discoveredRecipes} />
      </div>
    </div>
  );
}
