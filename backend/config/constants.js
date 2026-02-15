// Constantes du jeu
module.exports = {
  // Tresorerie initiale
  INITIAL_TREASURY: 500,

  // Satisfaction initiale au demarrage d'un service
  INITIAL_SATISFACTION: 20,

  // Penalite en or pour commande expiree ou rejetee
  PENALTY_AMOUNT: 15,

  // Perte de satisfaction pour commande expiree ou rejetee
  SATISFACTION_PENALTY: 10,

  // Gain de satisfaction pour commande servie
  SATISFACTION_REWARD: 1,

  // Delai minimum entre deux commandes (ms)
  ORDER_INTERVAL_MIN: 5000,

  // Delai maximum entre deux commandes (ms)
  ORDER_INTERVAL_MAX: 12000,

  // Temps avant expiration d'une commande (ms)
  ORDER_TIMEOUT: 30000,

  // Delai avant la premiere commande (ms)
  FIRST_ORDER_DELAY: 2000,

  // Prix par defaut d'une recette
  DEFAULT_RECIPE_PRICE: 50,

  // Nombre max de logs sur le client
  MAX_CLIENT_LOGS: 50,

  // === CRITIQUE VIP ===
  // Nombre d'etoiles initial
  INITIAL_STARS: 3,

  // Probabilite d'une commande VIP (0.0 - 1.0)
  VIP_CHANCE: 0.2,

  // Multiplicateur du prix pour les commandes VIP
  VIP_BONUS_MULTIPLIER: 3,

  // Penalite en or pour commande VIP ratee
  VIP_PENALTY_AMOUNT: 50,

  // Perte de satisfaction pour commande VIP ratee
  VIP_SATISFACTION_PENALTY: 15,

  // Gain de satisfaction pour commande VIP reussie
  VIP_SATISFACTION_REWARD: 5,

  // Temps pour servir une commande VIP (ms) - plus court
  VIP_ORDER_TIMEOUT: 20000,

  // === GESTION DES DLC (FIFO) ===
  // Duree de vie par defaut des ingredients (en services)
  DEFAULT_SHELF_LIFE: 3,

  // Intervalle du cron de nettoyage des perimes (en ms) - toutes les 60s
  EXPIRATION_CRON_INTERVAL: 60000
};
