export default function DiscoveredRecipes({ recipes }) {
  if (recipes.length === 0) return null;

  return (
    <div className="discovered-section">
      <h2>Recettes decouvertes ({recipes.length})</h2>
      <div className="recipes-list">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
