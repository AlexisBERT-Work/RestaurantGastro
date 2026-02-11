import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { serviceApi, labService, createSocket } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/ServicePage.css';

export default function ServicePage({ token, onLogout }) {
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [satisfaction, setSatisfaction] = useState(20);
  const [treasury, setTreasury] = useState(null);
  const [orders, setOrders] = useState([]);
  const [discoveredRecipeIds, setDiscoveredRecipeIds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const socketRef = useRef(null);
  const ordersRef = useRef(orders);
  const timerRef = useRef(null);

  // Keep ordersRef in sync
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Timer to update remaining time every second
  useEffect(() => {
    if (isServiceActive && !gameOver) {
      timerRef.current = setInterval(() => {
        setOrders(prev => {
          const now = Date.now();
          return prev.map(order => ({
            ...order,
            remainingTime: Math.max(0, order.expiresAt - now)
          }));
        });
      }, 200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isServiceActive, gameOver]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [token]);

  const loadInitialData = async () => {
    try {
      const [discoveredRes, recipesRes, stateRes] = await Promise.all([
        serviceApi.getDiscoveredRecipeIds(token),
        labService.getUserRecipes(token),
        serviceApi.getServiceState(token)
      ]);
      setDiscoveredRecipeIds(discoveredRes.data.recipeIds || []);
      setDiscoveredCount(recipesRes.data.recipes?.length || 0);
      setTreasury(stateRes.data.treasury ?? 500);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [{
      id: Date.now() + Math.random(),
      message: msg,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));
  }, []);

  // Socket connection & event handling
  useEffect(() => {
    if (!token) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      addLog('Connecte au serveur', 'info');
    });

    socket.on('disconnect', () => {
      addLog('Deconnecte du serveur', 'warning');
    });

    socket.on('connect_error', (err) => {
      addLog(`Erreur de connexion : ${err.message}`, 'error');
    });

    socket.on('service:started', (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      setIsServiceActive(true);
      setGameOver(false);
      setOrders([]);
      addLog('Service demarre ! Les commandes arrivent...', 'success');
    });

    socket.on('service:stopped', () => {
      setIsServiceActive(false);
      setOrders([]);
      addLog('Service arrete', 'info');
    });

    socket.on('order:new', (order) => {
      const newOrder = {
        ...order,
        remainingTime: order.timeLimit
      };
      setOrders(prev => [...prev, newOrder]);
      addLog(`Nouvelle commande : ${order.recipeName} (${order.difficulty}) - ${order.price}G`, 'info');
    });

    socket.on('order:serve_result', (data) => {
      if (data.success) {
        setSatisfaction(data.satisfaction);
        if (data.treasury !== undefined) setTreasury(data.treasury);
        setOrders(prev => prev.filter(o => o.id !== data.orderId));
        addLog(data.message, 'success');
      } else {
        if (data.satisfaction !== undefined) {
          setSatisfaction(data.satisfaction);
        }
        if (data.treasury !== undefined) setTreasury(data.treasury);
        if (data.orderId) {
          setOrders(prev => prev.filter(o => o.id !== data.orderId));
        }
        addLog(data.message, 'error');
      }
    });

    socket.on('order:expired', (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
      addLog(data.message, 'error');
    });

    socket.on('order:rejected', (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
      addLog(data.message, 'warning');
    });

    socket.on('service:gameover', (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      setGameOver(true);
      setGameOverMessage(data.message);
      setIsServiceActive(false);
      setOrders([]);
      addLog(data.message, 'error');
    });

    socket.on('service:error', (data) => {
      addLog(`${data.message}`, 'error');
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, addLog]);

  const handleStartService = () => {
    if (discoveredCount === 0) {
      addLog('Vous devez d\'abord decouvrir des recettes au Laboratoire !', 'warning');
      return;
    }
    socketRef.current?.emit('service:start');
  };

  const handleStopService = () => {
    socketRef.current?.emit('service:stop');
  };

  const handleServeOrder = (order) => {
    socketRef.current?.emit('order:serve', {
      orderId: order.id,
      recipeId: order.recipeId
    });
  };

  const handleRejectOrder = (order) => {
    socketRef.current?.emit('order:reject', {
      orderId: order.id
    });
  };

  const canServeOrder = (order) => {
    return discoveredRecipeIds.includes(order.recipeId);
  };

  const getSatisfactionColor = () => {
    if (satisfaction >= 15) return '#27ae60';
    if (satisfaction >= 8) return '#f39c12';
    return '#e74c3c';
  };

  const getSatisfactionEmoji = () => {
    if (satisfaction >= 15) return '';
    if (satisfaction >= 8) return '';
    if (satisfaction >= 3) return '';
    return '';
  };

  const getTimerColor = (remainingTime, totalTime) => {
    const ratio = remainingTime / totalTime;
    if (ratio > 0.5) return '#27ae60';
    if (ratio > 0.25) return '#f39c12';
    return '#e74c3c';
  };

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="service-container">
      <Navbar token={token} onLogout={onLogout} treasury={treasury} />

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item satisfaction-display">
          <span className="status-label">Satisfaction</span>
          <div className="satisfaction-bar-wrapper">
            <div
              className="satisfaction-bar-fill"
              style={{
                width: `${Math.max(0, Math.min(100, (satisfaction / 20) * 100))}%`,
                backgroundColor: getSatisfactionColor()
              }}
            />
          </div>
          <span className="satisfaction-value" style={{ color: getSatisfactionColor() }}>
            {getSatisfactionEmoji()} {satisfaction}/20
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
          <span className="status-value">{orders.length}</span>
        </div>
        <div className="status-item">
          <span className={`service-status ${isServiceActive ? 'active' : 'inactive'}`}>
            {isServiceActive ? 'OUVERT' : 'FERME'}
          </span>
        </div>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-box">
            <h2>GAME OVER</h2>
            <p>{gameOverMessage || 'Le restaurant a ete ferme.'}</p>
            <p>Satisfaction: {satisfaction} | Tresorerie: {treasury}G</p>
            <button onClick={() => { setGameOver(false); setSatisfaction(20); }} className="btn-restart">
              Reessayer
            </button>
          </div>
        </div>
      )}

      <div className="service-content">
        {/* Control Panel */}
        <div className="control-panel">
          {!isServiceActive ? (
            <button onClick={handleStartService} className="btn-start-service" disabled={gameOver}>
              Demarrer le service
            </button>
          ) : (
            <button onClick={handleStopService} className="btn-stop-service">
              Arreter le service
            </button>
          )}
          {!isServiceActive && discoveredCount === 0 && (
            <p className="service-hint">
              Allez au <Link to="/lab">Laboratoire</Link> pour decouvrir des recettes avant de demarrer le service !
            </p>
          )}
        </div>

        {/* Orders Section */}
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
              {orders.map((order) => {
                const canServe = canServeOrder(order);
                const timerRatio = (order.remainingTime || 0) / order.timeLimit;
                return (
                  <div
                    key={order.id}
                    className={`order-card ${canServe ? 'servable' : 'not-servable'}`}
                  >
                    <div className="order-header">
                      <h3>{order.recipeName}</h3>
                      <span className={`difficulty-badge ${order.difficulty}`}>
                        {order.difficulty}
                      </span>
                    </div>
                    <div className="order-price">{order.price}G</div>

                    {/* Timer bar */}
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
                        <button
                          onClick={() => handleServeOrder(order)}
                          className="btn-serve"
                        >
                          Servir (+{order.price}G)
                        </button>
                      ) : (
                        <button className="btn-serve" disabled>
                          Recette inconnue
                        </button>
                      )}
                      <button
                        onClick={() => handleRejectOrder(order)}
                        className="btn-reject"
                      >
                        Rejeter (-15G)
                      </button>
                    </div>

                    {!canServe && (
                      <p className="order-hint">Decouvrez cette recette au Laboratoire d'abord !</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="log-section">
          <h2>Journal d'activite</h2>
          <div className="log-container">
            {logs.length === 0 ? (
              <p className="log-empty">Aucune activite pour le moment...</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`log-entry log-${log.type}`}>
                  <span className="log-time">{log.time}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
