import axios from 'axios';
import Cookies from 'js-cookie';

// Prioritize environment variable, fallback to HTTPS
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

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

export const logout = async () => {
  try {
    // Get the current customer
    const customer = getCurrentCustomer();
    
    if (customer) {
      // Find tables associated with this customer
      const tables = await fetchTablesByCustomerId(customer['Customer Id']);
      
      // Clear customer assignment from tables
      for (const table of tables) {
        try {
          await updateTable(table['Table No'], null);
        } catch (error) {
          console.error(`Failed to clear table ${table['Table No']}:`, error);
        }
      }
    }
    
    // Remove the customer cookie
    Cookies.remove('customer', { 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
    
    // Clear current order info
    Cookies.remove('currentOrderId');
    Cookies.remove('orderStatus');
    Cookies.remove('cart');
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    // Still remove the cookie even if clearing tables fails
    Cookies.remove('customer');
    Cookies.remove('currentOrderId');
    Cookies.remove('orderStatus');
    Cookies.remove('cart');
    return true;
  }
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

// Table services
export const fetchAllTables = async () => {
  try {
    const response = await api.get('/Table');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchTableById = async (tableNo) => {
  try {
    const response = await api.get(`/Table/${tableNo}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchTablesByCustomerId = async (customerId) => {
  try {
    const response = await api.get(`/Table/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTable = async (tableNo, customerId) => {
  try {
    const response = await api.post('/Table', { tableNo, customerId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTable = async (tableNo, customerId) => {
  try {
    const response = await api.put(`/Table/${tableNo}`, { customerId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTable = async (tableNo) => {
  try {
    const response = await api.delete(`/Table/${tableNo}`);
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

// Enhanced Order services
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

    // Format dishes for the API with additional properties for better tracking
    const dishes = cartItems.map(item => ({
      "Dish Id": item.dish['Dish Id'],
      "Quantity": item.quantity,
      "Name": item.dish.Name,  // Add name for better display
      "Price": item.dish.Price // Add price to track individual dish prices
    }));

    // Get current date and time
    const now = new Date();
    
    // Format date as YYYY-MM-DD for MySQL
    const formattedDate = now.toISOString().split('T')[0];
    
    // Format time as HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    // Prepare order payload
    const orderPayload = {
      "Customer Id": customerId,
      "Table No": tableNo,
      "Amount": amount,
      "Time": time,
      "Date": formattedDate,
      "Dishes": dishes,
      "Payment Status": false,
      "Serving Status": false
    };

    console.log('Sending new order payload:', {
      date: formattedDate,
      time,
      tableNo,
      dishCount: dishes.length,
      amount
    });
    
    const response = await api.post('/Order', orderPayload);
    return response.data;
  } catch (error) {
    console.error('Order placement error:', error);
    throw error;
  }
};

export const fetchOrdersByCustomerId = async (customerId) => {
  try {
    const response = await api.get(`/Order/customer/${customerId}`);
    return response.data;
  } catch (error) {
    // If the specific endpoint fails, try the fallback approach
    try {
      const allOrdersResponse = await api.get('/Order');
      // Filter orders by customer ID
      const customerOrders = allOrdersResponse.data.filter(order => 
        order['Customer Id'] === customerId
      );
      return customerOrders;
    } catch (fallbackError) {
      throw fallbackError;
    }
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
    // Create a simplified update payload with only what needs to change
    const updatePayload = {
      "Payment Status": status.payment !== undefined ? status.payment : undefined,
      "Serving Status": status.serving !== undefined ? status.serving : undefined
    };
    
    // Remove undefined fields
    Object.keys(updatePayload).forEach(key => 
      updatePayload[key] === undefined && delete updatePayload[key]
    );
    
    // Only proceed if we have fields to update
    if (Object.keys(updatePayload).length === 0) {
      throw new Error('No status fields provided for update');
    }
    
    console.log('Updating order status:', {
      orderId,
      ...updatePayload
    });
    
    const response = await api.put(`/Order/${orderId}`, updatePayload);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get latest order for the customer
export const getLatestCustomerOrder = async (customerId) => {
  try {
    const orders = await fetchOrdersByCustomerId(customerId);
    if (!orders || orders.length === 0) {
      return null;
    }
    
    // Sort orders by date and time (most recent first)
    const sortedOrders = orders.sort((a, b) => {
      // Parse dates in "YYYY-MM-DD" format
      const [aYear, aMonth, aDay] = a.Date.split('-').map(Number);
      const [bYear, bMonth, bDay] = b.Date.split('-').map(Number);
      
      // Compare dates
      if (aYear !== bYear) return bYear - aYear;
      if (aMonth !== bMonth) return bMonth - aMonth;
      if (aDay !== bDay) return bDay - aDay;
      
      // If dates are equal, compare times
      return b.Time.localeCompare(a.Time);
    });
    
    return sortedOrders[0];
  } catch (error) {
    console.error('Error getting latest order:', error);
    return null;
  }
};

// Add items to an existing order
export const addItemsToOrder = async (orderId, newItems) => {
  try {
    if (!newItems || newItems.length === 0) {
      throw new Error('No items to add');
    }

    // First get the current order
    const order = await fetchOrderById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Format new items
    const newDishItems = newItems.map(item => ({
      "Dish Id": item.dish['Dish Id'],
      "Quantity": item.quantity,
      "Name": item.dish.Name,  // Add name for better display
      "Price": item.dish.Price // Add price to track individual dish prices
    }));
    
    // Ensure existing dishes is an array
    let existingDishes = [];
    try {
      // Handle both string and array formats
      if (typeof order.Dishes === 'string') {
        existingDishes = JSON.parse(order.Dishes);
      } else if (Array.isArray(order.Dishes)) {
        existingDishes = order.Dishes;
      }
    } catch (e) {
      console.error('Error parsing existing dishes:', e);
    }
    
    // Merge dishes more intelligently - if dish already exists, add quantities
    const updatedDishes = [...existingDishes];
    
    newDishItems.forEach(newItem => {
      const existingItemIndex = updatedDishes.findIndex(item => item['Dish Id'] === newItem['Dish Id']);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        updatedDishes[existingItemIndex].Quantity += newItem.Quantity;
      } else {
        // New item, add to array
        updatedDishes.push(newItem);
      }
    });
    
    // Calculate additional amount from new dishes
    const additionalAmount = newDishItems.reduce((total, item) => {
      return total + (item.Price * item.Quantity);
    }, 0);
    
    // Calculate new total amount
    const newAmount = (order.Amount || 0) + additionalAmount;
    
    // Create a simplified update payload with only what needs to change
    const updatePayload = {
      Dishes: updatedDishes,
      Amount: newAmount,
      "Serving Status": false // Reset serving status when adding items
    };
    
    console.log('Updating order with new items:', {
      orderId,
      dishCount: updatedDishes.length,
      amount: newAmount
    });
    
    const response = await api.put(`/Order/${orderId}`, updatePayload);
    return response.data;
  } catch (error) {
    console.error('Error adding items to order:', error);
    throw error;
  }
};

// Process payment for an order
export const processPayment = async (orderId) => {
  try {
    const order = await fetchOrderById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (!order['Serving Status']) {
      throw new Error('Cannot process payment until food is served');
    }
    
    // Only update the Payment Status field, leave everything else unchanged
    const updatedOrder = {
      'Payment Status': true
    };
    
    console.log('Processing payment for order:', orderId);
    
    const response = await api.put(`/Order/${orderId}`, updatedOrder);
    return response.data;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// Check order serving status
export const checkOrderStatus = async (orderId) => {
  try {
    const order = await fetchOrderById(orderId);
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    return {
      orderId: order['Order Id'],
      isServed: Boolean(order['Serving Status']),
      isPaid: Boolean(order['Payment Status']),
      amount: order.Amount,
      dishes: order.Dishes
    };
  } catch (error) {
    console.error(`Error checking status for order ${orderId}:`, error);
    throw error;
  }
};

// Poll for order status updates with debouncing
let activePollingInterval = null;

export const startOrderStatusPolling = (orderId, callback, interval = 30000) => {
  // Clear any existing polling for this or other orders
  if (activePollingInterval) {
    clearInterval(activePollingInterval);
    activePollingInterval = null;
  }
  
  // Initial check
  checkOrderStatus(orderId)
    .then(callback)
    .catch(console.error);
  
  // Set up polling
  activePollingInterval = setInterval(() => {
    checkOrderStatus(orderId)
      .then(status => {
        callback(status);
        
        // If order is paid or served, slow down polling
        if (status.isPaid) {
          // Stop polling completely if paid
          clearInterval(activePollingInterval);
          activePollingInterval = null;
        } else if (status.isServed && interval < 60000) {
          // Slow down polling to once a minute when served
          clearInterval(activePollingInterval);
          activePollingInterval = setInterval(() => {
            checkOrderStatus(orderId)
              .then(callback)
              .catch(err => {
                console.error('Error in slower polling cycle:', err);
                clearInterval(activePollingInterval);
                activePollingInterval = null;
              });
          }, 60000);
        }
      })
      .catch(err => {
        console.error('Error polling order status:', err);
        clearInterval(activePollingInterval);
        activePollingInterval = null;
      });
  }, interval);
  
  // Return function to stop polling
  return () => {
    if (activePollingInterval) {
      clearInterval(activePollingInterval);
      activePollingInterval = null;
    }
  };
};

export default api;