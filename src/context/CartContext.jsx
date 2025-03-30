import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = Cookies.get('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
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
      return newCart;
    });
  };

  const removeFromCart = (dishId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.dish['Dish Id'] !== dishId);
      Cookies.set('cart', JSON.stringify(newCart), { expires: 7 });
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
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    Cookies.remove('cart');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.dish.Price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);