import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/Customer/login', { email, password });
    if (response.data) {
      Cookies.set('customer', JSON.stringify(response.data), { expires: 7 });
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const register = async (customerData) => {
  try {
    const response = await api.post('/Customer', customerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const fetchDishes = async () => {
  try {
    const response = await api.get('/Dish');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const fetchCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/Customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export default api;