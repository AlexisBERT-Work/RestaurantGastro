export default function ExperimentPanel({
  ingredients,
  selectedIngredients,
  message,
  messageType,
  onIngredientClick,
  onRemoveIngredient,
  onExperiment,
  onClear
}) {
  return (
    <>
      {/* Ingredients disponibles */}
      <div className="ingredients-section">
        <h2>Ingredients disponibles</h2>
        <div className="ingredients-grid">
          {ingredients.map((ing) => (
            <button
              key={ing._id}
              className={`ingredient-card ${ing.quantity <= 0 ? 'out-of-stock' : ''}`}
              onClick={() => onIngredientClick(ing)}
              title={ing.description}
              disabled={ing.quantity <= 0}
            >
              <span className="ing-name">{ing.name}</span>
              <span className="stock-badge">{ing.quantity}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Melange actuel */}
      <div className="experiment-section">
        <h2>Melange actuel</h2>
        <div className="selected-ingredients">
          {selectedIngredients.length === 0 ? (
            <p className="empty-state">Cliquez sur les ingredients pour les ajouter...</p>
          ) : (
            selectedIngredients.map((ing, idx) => (
              <div key={idx} className="ingredient-tag">
                {ing}
                <button onClick={() => onRemoveIngredient(idx)}>x</button>
              </div>
            ))
          )}
        </div>

        <div className="experiment-buttons">
          <button onClick={onExperiment} className="btn-experiment">
            Experimenter
          </button>
          <button onClick={onClear} className="btn-clear">
            Effacer
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}
