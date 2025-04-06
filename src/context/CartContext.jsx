import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState({
    isServed: false,
    isPaid: false
  });

  // Initialize from cookies on mount
  useEffect(() => {
    console.log("Initializing cart provider from cookies");
    
    // Load cart items
    const storedCart = Cookies.get('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
        console.log("Loaded cart from cookie");
      } catch (e) {
        console.error("Error parsing cart cookie:", e);
      }
    }
    
    // Load current order id
    const storedOrderId = Cookies.get('currentOrderId');
    if (storedOrderId) {
      console.log("Found stored order ID:", storedOrderId);
      setCurrentOrderId(storedOrderId);
    }
    
    // Load order status
    const storedOrderStatus = Cookies.get('orderStatus');
    if (storedOrderStatus) {
      try {
        setOrderStatus(JSON.parse(storedOrderStatus));
        console.log("Loaded order status from cookie");
      } catch (e) {
        console.error("Error parsing order status cookie:", e);
      }
    }
  }, []);

  const addToCart = (dish, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish['Dish Id'] === dish['Dish Id']);
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map(item => 
          item.dish['Dish Id'] === dish['Dish Id'] 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        newCart = [...prevCart, { dish, quantity }];
      }
      
      Cookies.set('cart', JSON.stringify(newCart), { expires: 7 });
      console.log("Updated cart cookie");
      return newCart;
    });
  };

  const removeFromCart = (dishId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.dish['Dish Id'] !== dishId);
      Cookies.set('cart', JSON.stringify(newCart), { expires: 7 });
      console.log("Updated cart cookie after removal");
      return newCart;
    });
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = prevCart.map(item => 
        item.dish['Dish Id'] === dishId ? { ...item, quantity } : item
      );
      Cookies.set('cart', JSON.stringify(newCart), { expires: 7 });
      console.log("Updated cart quantity");
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    Cookies.remove('cart');
    console.log("Cleared cart cookie");
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.dish.Price * item.quantity), 0);
  };
  
  const setCurrentOrder = (orderId) => {
    console.log("Setting current order ID:", orderId);
    setCurrentOrderId(orderId);
    if (orderId) {
      Cookies.set('currentOrderId', orderId, { expires: 1 });
    } else {
      Cookies.remove('currentOrderId');
    }
  };
  
  const clearCurrentOrder = () => {
    console.log("Clearing current order");
    setCurrentOrderId(null);
    Cookies.remove('currentOrderId');
  };
  
  const updateOrderStatus = (status) => {
    console.log("Updating order status:", status);
    setOrderStatus(status);
    Cookies.set('orderStatus', JSON.stringify(status), { expires: 1 });
    
    // If order is paid, clear the cart and order info
    if (status.isPaid) {
      console.log("Order paid, clearing cart and order info");
      clearCart();
      clearCurrentOrder();
      setOrderStatus({ isServed: false, isPaid: false });
      Cookies.remove('orderStatus');
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getTotal,
      currentOrderId,
      setCurrentOrder,
      clearCurrentOrder,
      orderStatus,
      updateOrderStatus
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);