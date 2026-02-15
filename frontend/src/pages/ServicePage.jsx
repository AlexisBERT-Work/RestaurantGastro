import { Link } from 'react-router-dom';
import useServiceSocket from '../hooks/useServiceSocket';
import Navbar from '../components/Navbar';
import StatusBar from '../components/StatusBar';
import GameOverOverlay from '../components/GameOverOverlay';
import OrderCard from '../components/OrderCard';
import ActivityLog from '../components/ActivityLog';
import '../styles/ServicePage.css';

export default function ServicePage({ token, onLogout }) {
  const {
    isServiceActive,
    satisfaction,
    treasury,
    stars,
    orders,
    logs,
    gameOver,
    gameOverMessage,
    discoveredCount,
    startService,
    stopService,
    serveOrder,
    rejectOrder,
    canServeOrder,
    resetGameOver
  } = useServiceSocket(token);

  return (
    <div className="service-container">
      <Navbar token={token} onLogout={onLogout} treasury={treasury} />

      <StatusBar
        satisfaction={satisfaction}
        treasury={treasury}
        stars={stars}
        discoveredCount={discoveredCount}
        ordersCount={orders.length}
        isServiceActive={isServiceActive}
      />

      {gameOver && (
        <GameOverOverlay
          message={gameOverMessage}
          satisfaction={satisfaction}
          treasury={treasury}
          stars={stars}
          onRestart={resetGameOver}
        />
      )}

      <div className="service-content">
        {/* Panneau de controle */}
        <div className="control-panel">
          {!isServiceActive ? (
            <button onClick={startService} className="btn-start-service" disabled={gameOver}>
              Demarrer le service
            </button>
          ) : (
            <button onClick={stopService} className="btn-stop-service">
              Arreter le service
            </button>
          )}
          {!isServiceActive && discoveredCount === 0 && (
            <p className="service-hint">
              Allez au <Link to="/lab">Laboratoire</Link> pour decouvrir des recettes avant de demarrer le service !
            </p>
          )}
        </div>

        {/* Section des commandes */}
        <div className="orders-section">
          <h2>Commandes entrantes</h2>
          {orders.length === 0 ? (
            <div className="no-orders">
              {isServiceActive
                ? 'En attente de commandes...'
                : 'Demarrez le service pour recevoir des commandes'}
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  canServe={canServeOrder(order)}
                  onServe={serveOrder}
                  onReject={rejectOrder}
                />
              ))}
            </div>
          )}
        </div>

        <ActivityLog logs={logs} />
      </div>
    </div>
  );
}
