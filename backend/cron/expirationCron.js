const { removeExpiredLots } = require('../services/stockService');
const { EXPIRATION_CRON_INTERVAL } = require('../config/constants');

let cronInterval = null;

// Demarre le cron de nettoyage des ingredients perimes
function startExpirationCron() {
  if (cronInterval) return;

  console.log('[CRON] Demarrage du nettoyage des ingredients perimes');

  cronInterval = setInterval(async () => {
    try {
      const cleaned = await removeExpiredLots();
      if (cleaned > 0) {
        console.log(`[CRON] ${cleaned} document(s) nettoye(s) (lots perimes supprimes)`);
      }
    } catch (err) {
      console.error('[CRON] Erreur lors du nettoyage des perimes:', err);
    }
  }, EXPIRATION_CRON_INTERVAL);
}

// Arrete le cron
function stopExpirationCron() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log('[CRON] Cron de nettoyage arrete');
  }
}

module.exports = { startExpirationCron, stopExpirationCron };
