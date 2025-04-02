import axios from 'axios';
import Cookies from 'js-cookie';

// Prioritize environment variable, fallback to HTTPS
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://65.0.109.178:3000';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Important for CORS and cookie handling
});

// Request interceptor for adding auth token if available
api.interceptors.request.use(
  (config) => {
    const customer = Cookies.get('customer');
    if (customer) {
      try {
        const customerData = JSON.parse(customer);
        // Optional: Add authorization if your backend requires it
        // Uncomment and modify as needed
        // config.headers.Authorization = `Bearer ${customerData.token}`;
      } catch (error) {
        console.error('Error parsing customer cookie', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    const statusCode = error.response?.status || 500;
    
    // Enhanced error logging
    console.error(`API Error (${statusCode}): ${errorMessage}`, {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    });
    
    return Promise.reject({
      message: errorMessage,
      status: statusCode,
      originalError: error
    });
  }
);

// Auth services
export const login = async (email, password) => {
  try {
    const response = await api.post('/Customer/login', { email, password });
    if (response.data) {
      // Store customer data securely with additional options
      Cookies.set('customer', JSON.stringify(response.data), { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
        sameSite: 'strict' // Protect against CSRF
      });
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  Cookies.remove('customer', { 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  });
  return true;
};

export const getCurrentCustomer = () => {
  const customerCookie = Cookies.get('customer');
  return customerCookie ? JSON.parse(customerCookie) : null;
};

export const register = async (customerData) => {
  try {
    const response = await api.post('/Customer', customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Customer services
export const fetchCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/Customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await api.put(`/Customer/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Dish services
export const fetchDishes = async () => {
  try {
    const response = await api.get('/Dish');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDishById = async (dishId) => {
  try {
    const response = await api.get(`/Dish/${dishId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDishesByCategory = async (category) => {
  try {
    const response = await api.get('/Dish');
    // Filter by category on client side since the API might not support filtering
    const filteredDishes = response.data.filter(dish => 
      dish['Type of Dish'] && dish['Type of Dish'].includes(category)
    );
    return filteredDishes;
  } catch (error) {
    throw error;
  }
};

// Order services
export const placeOrder = async (orderData) => {
  try {
    const response = await api.post('/Order', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const placeOrderFromCart = async (cartItems, tableNo, customerId) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    if (!tableNo) {
      throw new Error('Table number is required');
    }

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    // Calculate total amount
    const amount = cartItems.reduce((total, item) => {
      return total + (item.dish.Price * item.quantity);
    }, 0);

    // Format dishes for the API
    const dishes = cartItems.map(item => ({
      "Dish Id": item.dish['Dish Id'],
      "Quantity": item.quantity
    }));

    // Get current date and time
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].substring(0, 5); // Format: HH:MM

    // Prepare order payload
    const orderPayload = {
      "Customer Id": customerId,
      "Table No": tableNo,
      "Amount": amount,
      "Time": time,
      "Date": date,
      "Dishes": dishes,
      "Payment Status": false,
      "Serving Status": false
    };

    const response = await api.post('/Order', orderPayload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchOrdersByCustomerId = async (customerId) => {
  try {
    const response = await api.get('/Order');
    // Filter orders by customer ID since the API might not have this endpoint
    const customerOrders = response.data.filter(order => 
      order['Customer Id'] === customerId
    );
    return customerOrders;
  } catch (error) {
    throw error;
  }
};

export const fetchOrderById = async (orderId) => {
  try {
    const response = await api.get(`/Order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await fetchOrderById(orderId);
    const updatedOrder = {
      ...order,
      "Payment Status": status.payment !== undefined ? status.payment : order["Payment Status"],
      "Serving Status": status.serving !== undefined ? status.serving : order["Serving Status"]
    };
    
    const response = await api.put(`/Order/${orderId}`, updatedOrder);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;