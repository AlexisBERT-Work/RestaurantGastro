import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import LabPage from './pages/LabPage';
import RecipesPage from './pages/RecipesPage';
import ServicePage from './pages/ServicePage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Optionally decode JWT to get user info
    }
  }, []);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/lab" /> : <AuthPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/lab" 
          element={token ? <LabPage token={token} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/recipes" 
          element={token ? <RecipesPage token={token} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/service" 
          element={token ? <ServicePage token={token} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
