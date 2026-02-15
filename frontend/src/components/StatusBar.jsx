import { getSatisfactionColor } from '../utils/serviceHelpers';

export default function StatusBar({ satisfaction, treasury, stars, discoveredCount, ordersCount, isServiceActive }) {
  const starDisplay = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  return (
    <div className="status-bar">
      <div className="status-item satisfaction-display">
        <span className="status-label">Satisfaction</span>
        <div className="satisfaction-bar-wrapper">
          <div
            className="satisfaction-bar-fill"
            style={{
              width: `${Math.max(0, Math.min(100, (satisfaction / 20) * 100))}%`,
              backgroundColor: getSatisfactionColor(satisfaction)
            }}
          />
        </div>
        <span className="satisfaction-value" style={{ color: getSatisfactionColor(satisfaction) }}>
          {satisfaction}/20
        </span>
      </div>

      <div className="status-item stars-display">
        <span className="status-label">Etoiles</span>
        <span className={`stars-value ${stars <= 1 ? 'critical' : ''}`}>
          {starDisplay}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Tresorerie</span>
        <span className={`status-value treasury-value ${treasury !== null && treasury < 50 ? 'low' : ''}`}>
          {treasury !== null ? `${treasury}G` : '...'}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Recettes decouvertes</span>
        <span className="status-value">{discoveredCount}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Commandes actives</span>
        <span className="status-value">{ordersCount}</span>
      </div>

      <div className="status-item">
        <span className={`service-status ${isServiceActive ? 'active' : 'inactive'}`}>
          {isServiceActive ? 'OUVERT' : 'FERME'}
        </span>
      </div>
    </div>
  );
}
