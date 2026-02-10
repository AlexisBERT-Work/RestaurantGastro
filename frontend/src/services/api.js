import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
