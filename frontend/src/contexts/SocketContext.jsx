import { createContext, useContext, useState, useEffect } from 'react';
import { createSocket } from '../services/api';

const SocketContext = createContext(null);

// Provider qui maintient la connexion Socket.io tant que l'utilisateur est connecte
export function SocketProvider({ token, children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(prev => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    const newSocket = createSocket(token);
    newSocket.connect();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
