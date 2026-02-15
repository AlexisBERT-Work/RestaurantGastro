import { useState, useEffect, useRef, useCallback } from 'react';
import { serviceApi, labService } from '../services/api';
import { useSocket } from '../contexts/SocketContext';

const MAX_LOGS = 50;

// Hook personnalise pour gerer la connexion Socket.io du service
export default function useServiceSocket(token) {
  const socket = useSocket();
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [satisfaction, setSatisfaction] = useState(20);
  const [treasury, setTreasury] = useState(null);
  const [stars, setStars] = useState(3);
  const [orders, setOrders] = useState([]);
  const [discoveredRecipeIds, setDiscoveredRecipeIds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [discoveredCount, setDiscoveredCount] = useState(0);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // Garde le ref en sync avec le socket du contexte
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Ajoute une entree au journal d'activite
  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [{
      id: Date.now() + Math.random(),
      message: msg,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, MAX_LOGS));
  }, []);

  // Charge les donnees initiales (recettes decouvertes, etat du service)
  useEffect(() => {
    if (!token) return;

    const loadInitialData = async () => {
      try {
        const [discoveredRes, recipesRes, stateRes] = await Promise.all([
          serviceApi.getDiscoveredRecipeIds(token),
          labService.getUserRecipes(token),
          serviceApi.getServiceState(token)
        ]);
        setDiscoveredRecipeIds(discoveredRes.data.recipeIds || []);
        setDiscoveredCount(recipesRes.data.recipes?.length || 0);

        const state = stateRes.data;
        setTreasury(state.treasury ?? 500);
        setStars(state.stars ?? 3);
        // Restaure l'etat du service si actif cote serveur
        if (state.isServiceActive) {
          setIsServiceActive(true);
          setSatisfaction(state.satisfaction ?? 20);
        }
      } catch (err) {
        console.error('Echec du chargement des donnees initiales:', err);
      }
    };

    loadInitialData();
  }, [token]);

  // Timer pour mettre a jour le temps restant sur les commandes
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

  // Abonnement aux evenements Socket.io (le socket vit dans le Context)
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => addLog('Connecte au serveur', 'info');
    const onDisconnect = () => addLog('Deconnecte du serveur', 'warning');
    const onConnectError = (err) => addLog(`Erreur de connexion : ${err.message}`, 'error');

    const onStarted = (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      if (data.stars !== undefined) setStars(data.stars);
      setIsServiceActive(true);
      setGameOver(false);
      setOrders([]);
      addLog('Service demarre ! Les commandes arrivent...', 'success');
    };

    const onStopped = () => {
      setIsServiceActive(false);
      setOrders([]);
      addLog('Service arrete', 'info');
    };

    const onNewOrder = (order) => {
      setOrders(prev => [...prev, { ...order, remainingTime: order.timeLimit }]);
      const vipTag = order.isVip ? ' [VIP]' : '';
      addLog(`Nouvelle commande${vipTag} : ${order.recipeName} (${order.difficulty}) - ${order.price}G`, order.isVip ? 'warning' : 'info');
    };

    const onServeResult = (data) => {
      if (data.success) {
        setSatisfaction(data.satisfaction);
        if (data.treasury !== undefined) setTreasury(data.treasury);
        if (data.stars !== undefined) setStars(data.stars);
        setOrders(prev => prev.filter(o => o.id !== data.orderId));
        addLog(data.message, 'success');
      } else {
        if (data.satisfaction !== undefined) setSatisfaction(data.satisfaction);
        if (data.treasury !== undefined) setTreasury(data.treasury);
        if (data.stars !== undefined) setStars(data.stars);
        if (data.orderId) setOrders(prev => prev.filter(o => o.id !== data.orderId));
        addLog(data.message, 'error');
      }
    };

    const onExpired = (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      if (data.stars !== undefined) setStars(data.stars);
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
      addLog(data.message, 'error');
    };

    const onRejected = (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      if (data.stars !== undefined) setStars(data.stars);
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
      addLog(data.message, 'warning');
    };

    const onGameOver = (data) => {
      setSatisfaction(data.satisfaction);
      if (data.treasury !== undefined) setTreasury(data.treasury);
      if (data.stars !== undefined) setStars(data.stars);
      setGameOver(true);
      setGameOverMessage(data.message);
      setIsServiceActive(false);
      setOrders([]);
      addLog(data.message, 'error');
    };

    const onError = (data) => addLog(data.message, 'error');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('service:started', onStarted);
    socket.on('service:stopped', onStopped);
    socket.on('order:new', onNewOrder);
    socket.on('order:serve_result', onServeResult);
    socket.on('order:expired', onExpired);
    socket.on('order:rejected', onRejected);
    socket.on('service:gameover', onGameOver);
    socket.on('service:error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('service:started', onStarted);
      socket.off('service:stopped', onStopped);
      socket.off('order:new', onNewOrder);
      socket.off('order:serve_result', onServeResult);
      socket.off('order:expired', onExpired);
      socket.off('order:rejected', onRejected);
      socket.off('service:gameover', onGameOver);
      socket.off('service:error', onError);
    };
  }, [socket, addLog]);

  // Actions du joueur
  const startService = () => {
    if (discoveredCount === 0) {
      addLog('Vous devez d\'abord decouvrir des recettes au Laboratoire !', 'warning');
      return;
    }
    socketRef.current?.emit('service:start');
  };

  const stopService = () => {
    socketRef.current?.emit('service:stop');
  };

  const serveOrder = (order) => {
    socketRef.current?.emit('order:serve', {
      orderId: order.id,
      recipeId: order.recipeId
    });
  };

  const rejectOrder = (order) => {
    socketRef.current?.emit('order:reject', { orderId: order.id });
  };

  const canServeOrder = (order) => {
    return discoveredRecipeIds.includes(order.recipeId);
  };

  const resetGameOver = () => {
    setGameOver(false);
    setSatisfaction(20);
  };

  return {
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
  };
}
