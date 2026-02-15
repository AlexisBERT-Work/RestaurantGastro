// Utilitaires pour le service en temps reel

// Couleur de la barre de satisfaction selon le niveau
export function getSatisfactionColor(satisfaction) {
  if (satisfaction >= 15) return '#27ae60';
  if (satisfaction >= 8) return '#f39c12';
  return '#e74c3c';
}

// Couleur du timer selon le temps restant
export function getTimerColor(remainingTime, totalTime) {
  const ratio = remainingTime / totalTime;
  if (ratio > 0.5) return '#27ae60';
  if (ratio > 0.25) return '#f39c12';
  return '#e74c3c';
}

// Formate les millisecondes en secondes lisibles
export function formatTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  return `${seconds}s`;
}
