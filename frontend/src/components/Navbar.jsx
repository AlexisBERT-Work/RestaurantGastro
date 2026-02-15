import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import './Navbar.css';

export default function Navbar({ token, onLogout, treasury: externalTreasury }) {
  const location = useLocation();
  const [treasury, setTreasury] = useState(externalTreasury ?? null);

  useEffect(() => {
    if (externalTreasury !== undefined && externalTreasury !== null) {
      setTreasury(externalTreasury);
    }
  }, [externalTreasury]);

  useEffect(() => {
    if (treasury === null) {
      loadTreasury();
    }
  }, [token]);

  const loadTreasury = async () => {
    try {
      const response = await transactionService.getTreasury(token);
      setTreasury(response.data.treasury);
    } catch (err) {
      console.error('Echec du chargement de la tresorerie:', err);
    }
  };

  const navItems = [
    { path: '/lab', label: 'Laboratoire' },
    { path: '/recipes', label: 'Recettes' },
    { path: '/service', label: 'Service' },
    { path: '/dashboard', label: 'Finances' }
  ];

  return (
    <header className="navbar">
      <h1 className="navbar-title">GastroChef</h1>

      <div className="navbar-treasury">
        <span className="treasury-label">Tresorerie</span>
        <span className={`treasury-amount ${treasury !== null && treasury < 50 ? 'low' : ''}`}>
          {treasury !== null ? `${treasury} G` : '...'}
        </span>
      </div>

      <div className="navbar-actions">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        <button onClick={onLogout} className="logout-btn">Deconnexion</button>
      </div>
    </header>
  );
}
