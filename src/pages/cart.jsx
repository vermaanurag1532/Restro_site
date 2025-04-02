import { Card, CardHeader, CardBody, CardFooter, Divider, Button, Image, Input } from '@nextui-org/react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { PlusIcon, MinusIcon } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { placeOrderFromCart, getCurrentCustomer } from '../services/api';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const router = useRouter();
  const [orderTotal, setOrderTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableNumberError, setTableNumberError] = useState('');
  
  useEffect(() => {
    if (cart.length > 0) {
      setOrderTotal(getTotal());
    }
  }, [cart, getTotal]);
  
  const handlePlaceOrder = async () => {
    try {
      setOrderError('');
      setTableNumberError('');
      
      // Validate table number
      if (!tableNumber.trim()) {
        setTableNumberError('Please enter your table number');
        return;
      }
      
      // Get current customer
      const customer = getCurrentCustomer();
      if (!customer) {
        router.push('/login?redirect=cart');
        return;
      }
      
      setIsPlacingOrder(true);
      
      // Call API to place order
      const result = await placeOrderFromCart(
        cart, 
        tableNumber.trim(),
        customer['Customer Id']
      );
      
      // Show success message and clear cart
      setOrderSuccess(true);
      clearCart();
      
      // Redirect to order confirmation after a delay
      setTimeout(() => {
        router.push(`/order-confirmation?id=${result['Order Id']}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  const MotionCard = motion(Card);

  return (
    <Layout title="Cart">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-6"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => router.push('/')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M19 12H5M5 12L12 19M5 12L12 5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </motion.div>
          <h1 className="text-2xl font-bold">Your Cart</h1>
        </motion.div>
        
        {cart.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-[60vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300 mb-6"
              >
                <path 
                  d="M7.5 7.67V6.7c0-2.25 1.81-4.46 4.06-4.67a4.5 4.5 0 0 1 4.94 4.48v1.38M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M15.5 12h.01M8.5 12h.01" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </motion.div>
            <motion.p 
              className="text-lg text-gray-500 mb-4 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {orderSuccess 
                ? "Your order has been placed successfully!" 
                : "Your cart is empty"}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                color="primary" 
                onClick={() => router.push('/')}
                size="lg"
                className="rounded-full px-8 font-medium shadow-lg"
              >
                Browse Menu
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <motion.div 
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between border-b pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-orange-500"
                    >
                      <path 
                        d="M17 20.5H7c-3 0-5-1.5-5-5v-7c0-3.5 2-5 5-5h10c3 0 5 1.5 5 5v7c0 3.5-2 5-5 5Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeMiterlimit="10" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      <path 
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeMiterlimit="10" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      <path 
                        d="M8.5 6H8M16 6h-1" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeMiterlimit="10" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                    <span className="font-bold">RedLinear Restro</span>
                  </div>
                  <span className="text-sm text-gray-500">{cart.length} items</span>
                </div>
                
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div 
                      key={item.dish['Dish Id']} 
                      className="py-3 border-b border-dashed border-gray-200 last:border-none"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                          <Image
                            alt={item.dish.Name}
                            className="object-cover h-full w-full"
                            src={`https://via.placeholder.com/150?text=${encodeURIComponent(item.dish.Name)}`}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-medium">{item.dish.Name}</h3>
                              <p className="text-primary-600 font-bold mt-1">₹{item.dish.Price}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₹{item.dish.Price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <motion.div 
                          className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm"
                          whileHover={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
                        >
                          <motion.button 
                            className="px-2 py-1 text-gray-500"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.dish['Dish Id'], item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon size={16} />
                          </motion.button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <motion.button 
                            className="px-2 py-1 text-gray-700"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.dish['Dish Id'], item.quantity + 1)}
                          >
                            <PlusIcon size={16} />
                          </motion.button>
                        </motion.div>
                        <motion.button 
                          className="text-sm text-red-500 font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.dish['Dish Id'])}
                        >
                          Remove
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.div 
              className="md:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <MotionCard 
                className="w-full sticky top-20"
                initial={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}
                whileHover={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)" }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <h3 className="text-lg font-bold">Bill Details</h3>
                </CardHeader>
                <CardBody className="py-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Item Total</span>
                      <span className="font-medium">₹{getTotal()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST and Restaurant Charges</span>
                      <span className="font-medium">Included</span>
                    </div>

                    <Divider className="my-2" />
                    
                    <div className="flex justify-between items-center font-bold">
                      <span>To Pay</span>
                      <motion.span
                        key={orderTotal}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.4 }}
                        className="text-lg text-primary"
                      >
                        ₹{orderTotal}
                      </motion.span>
                    </div>
                    
                    <Divider className="my-2" />
                    
                    {/* Table Number Input */}
                    <div className="mt-4">
                      <Input
                        placeholder="Enter your table number"
                        value={tableNumber}
                        onChange={(e) => {
                          setTableNumber(e.target.value);
                          setTableNumberError('');
                        }}
                        variant="bordered"
                        color={tableNumberError ? "danger" : "primary"}
                        errorMessage={tableNumberError}
                        required
                      />
                    </div>
                    
                    {/* Order Error Message */}
                    {orderError && (
                      <motion.div 
                        className="p-2 bg-red-50 border border-red-100 rounded text-red-600 text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {orderError}
                      </motion.div>
                    )}
                  </div>
                </CardBody>
                <CardFooter>
                  <motion.div className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      color="success" 
                      className="w-full py-6 font-bold text-base rounded-lg bg-green-500"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || cart.length === 0}
                    >
                      {isPlacingOrder ? (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                        >
                          Placing Order...
                        </motion.div>
                      ) : (
                        "PLACE ORDER"
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </MotionCard>
              
              <motion.div 
                className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-start">
                  <div className="text-blue-500 mr-3 mt-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.995 16H12.004" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">Please confirm your table number before placing the order. Your order will be prepared and served at your table.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;