import { getTimerColor, formatTime } from '../utils/serviceHelpers';

export default function OrderCard({ order, canServe, onServe, onReject }) {
  const timerRatio = (order.remainingTime || 0) / order.timeLimit;
  const isVip = order.isVip || false;

  return (
    <div className={`order-card ${canServe ? 'servable' : 'not-servable'} ${isVip ? 'vip-order' : ''}`}>
      {isVip && <div className="vip-badge">VIP</div>}

      <div className="order-header">
        <h3>{order.recipeName}</h3>
        <span className={`difficulty-badge ${order.difficulty}`}>
          {order.difficulty}
        </span>
      </div>

      <div className="order-price">{order.price}G {isVip && <span className="vip-bonus">x3</span>}</div>

      {/* Ingredients requis */}
      {order.requiredIngredients && order.requiredIngredients.length > 0 && (
        <div className="order-ingredients">
          <ul>
            {order.requiredIngredients.map((ing, idx) => (
              <li key={idx}>{ing.name} x{ing.quantity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Barre du timer */}
      <div className="timer-bar-wrapper">
        <div
          className="timer-bar-fill"
          style={{
            width: `${Math.max(0, timerRatio * 100)}%`,
            backgroundColor: getTimerColor(order.remainingTime || 0, order.timeLimit)
          }}
        />
      </div>
      <div className="timer-text">
        {formatTime(order.remainingTime || 0)}
      </div>

      {/* Actions */}
      <div className="order-actions">
        {canServe ? (
          <button onClick={() => onServe(order)} className="btn-serve">
            Servir (+{order.price}G)
          </button>
        ) : (
          <button className="btn-serve" disabled>
            Recette inconnue
          </button>
        )}
        <button onClick={() => onReject(order)} className="btn-reject">
          Rejeter {isVip ? '(-50G, -1★)' : '(-15G)'}
        </button>
      </div>

      {!canServe && (
        <p className="order-hint">Decouvrez cette recette au Laboratoire d'abord !</p>
      )}
    </div>
  );
}
