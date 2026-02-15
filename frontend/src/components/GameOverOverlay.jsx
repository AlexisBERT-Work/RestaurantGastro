export default function GameOverOverlay({ message, satisfaction, treasury, stars, onRestart }) {
  const starDisplay = stars !== undefined ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';

  return (
    <div className="game-over-overlay">
      <div className="game-over-box">
        <h2>FIN DE PARTIE</h2>
        <p>{message || 'Le restaurant a ete ferme.'}</p>
        <div className="game-over-stats">
          <p>Satisfaction: {satisfaction} | Tresorerie: {treasury}G</p>
          {stars !== undefined && (
            <p className="game-over-stars">Etoiles: {starDisplay}</p>
          )}
        </div>
        <button onClick={onRestart} className="btn-restart">
          Reessayer
        </button>
      </div>
    </div>
  );
}
