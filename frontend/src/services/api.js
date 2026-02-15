import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Instance axios avec header d'authentification automatique
function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ===== Auth =====
export const authService = {
  register: (restaurantName, email, password, passwordConfirm) =>
    axios.post(`${API_URL}/auth/register`, { restaurantName, email, password, passwordConfirm }),

  login: (email, password) =>
    axios.post(`${API_URL}/auth/login`, { email, password })
};

// ===== Laboratoire =====
export const labService = {
  experimentAndMatch: (ingredients, token) =>
    axios.post(`${API_URL}/lab/experiment`, { combinedIngredients: ingredients }, authHeaders(token)),

  getAllRecipes: (token) =>
    axios.get(`${API_URL}/lab/recipes/all`, authHeaders(token)),

  getUserRecipes: (token) =>
    axios.get(`${API_URL}/lab/recipes/my`, authHeaders(token)),

  getAllIngredients: (token) =>
    axios.get(`${API_URL}/recipes`, authHeaders(token))
};

// ===== Service =====
export const serviceApi = {
  getServiceState: (token) =>
    axios.get(`${API_URL}/service/state`, authHeaders(token)),

  startService: (token) =>
    axios.post(`${API_URL}/service/start`, {}, authHeaders(token)),

  stopService: (token) =>
    axios.post(`${API_URL}/service/stop`, {}, authHeaders(token)),

  getDiscoveredRecipeIds: (token) =>
    axios.get(`${API_URL}/service/discovered`, authHeaders(token))
};

// ===== Transactions =====
export const transactionService = {
  getTreasury: (token) =>
    axios.get(`${API_URL}/transactions/treasury`, authHeaders(token)),

  getTreasuryHistory: (token) =>
    axios.get(`${API_URL}/transactions/history`, authHeaders(token)),

  getExpenseBreakdown: (token) =>
    axios.get(`${API_URL}/transactions/breakdown`, authHeaders(token)),

  getProfitPerDish: (token) =>
    axios.get(`${API_URL}/transactions/profit-per-dish`, authHeaders(token)),

  getTransactions: (token, params = {}) =>
    axios.get(`${API_URL}/transactions`, { params, ...authHeaders(token) })
};

// ===== Stock Ingredients =====
export const ingredientStockService = {
  getUserStock: (token) =>
    axios.get(`${API_URL}/ingredients/stock`, authHeaders(token)),

  purchaseIngredient: (ingredientId, quantity, token) =>
    axios.post(`${API_URL}/ingredients/purchase`, { ingredientId, quantity }, authHeaders(token))
};

// ===== Socket.io =====
export const createSocket = (token) =>
  io(SOCKET_URL, { auth: { token }, autoConnect: false });
