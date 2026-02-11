import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const authService = {
  register: async (restaurantName, email, password, passwordConfirm) => {
    return await axios.post(`${API_URL}/auth/register`, {
      restaurantName,
      email,
      password,
      passwordConfirm
    });
  },

  login: async (email, password) => {
    return await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
  }
};

export const labService = {
  experimentAndMatch: async (ingredients, token) => {
    return await axios.post(`${API_URL}/lab/experiment`, 
      { combinedIngredients: ingredients },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getAllRecipes: async (token) => {
    return await axios.get(`${API_URL}/lab/recipes/all`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getUserRecipes: async (token) => {
    return await axios.get(`${API_URL}/lab/recipes/my`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getAllIngredients: async (token) => {
    return await axios.get(`${API_URL}/recipes`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};

export const serviceApi = {
  getServiceState: async (token) => {
    return await axios.get(`${API_URL}/service/state`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  startService: async (token) => {
    return await axios.post(`${API_URL}/service/start`, {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  stopService: async (token) => {
    return await axios.post(`${API_URL}/service/stop`, {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getDiscoveredRecipeIds: async (token) => {
    return await axios.get(`${API_URL}/service/discovered`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};

export const transactionService = {
  getTreasury: async (token) => {
    return await axios.get(`${API_URL}/transactions/treasury`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getTreasuryHistory: async (token) => {
    return await axios.get(`${API_URL}/transactions/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getExpenseBreakdown: async (token) => {
    return await axios.get(`${API_URL}/transactions/breakdown`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getProfitPerDish: async (token) => {
    return await axios.get(`${API_URL}/transactions/profit-per-dish`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getTransactions: async (token, params = {}) => {
    return await axios.get(`${API_URL}/transactions`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export const ingredientStockService = {
  getUserStock: async (token) => {
    return await axios.get(`${API_URL}/ingredients/stock`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  purchaseIngredient: async (ingredientId, quantity, token) => {
    return await axios.post(`${API_URL}/ingredients/purchase`,
      { ingredientId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};

// Socket.io connection factory
export const createSocket = (token) => {
  return io(SOCKET_URL, {
    auth: { token },
    autoConnect: false
  });
};
