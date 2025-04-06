import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Divider, Button, Image, Chip } from '@nextui-org/react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { PlusIcon, MinusIcon } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  placeOrderFromCart, 
  getCurrentCustomer, 
  fetchTablesByCustomerId,
  getLatestCustomerOrder,
  addItemsToOrder,
  processPayment,
  startOrderStatusPolling,
  checkOrderStatus,
  fetchOrderById
} from '../services/api';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getTotal, 
    clearCart,
    currentOrderId,
    setCurrentOrder,
    orderStatus,
    updateOrderStatus
  } = useCart();
  
  const router = useRouter();
  const [orderTotal, setOrderTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrder, setCurrentOrderData] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Fixed: Using motion(Card) instead of motion.create(Card)
  const MotionCard = motion(Card);
  
  // Calculate total
  useEffect(() => {
    if (cart.length > 0) {
      setOrderTotal(getTotal());
    }
  }, [cart, getTotal]);
  
  // Initial data load - get table and check for open orders
  useEffect(() => {
    let isActive = true;
    let stopPolling = null;
    
    // Prevent multiple initializations
    if (hasInitialized) return;
    
    const initializeCart = async () => {
      try {
        setIsLoading(true);
        const customer = getCurrentCustomer();
        
        if (!customer) {
          if (isActive) {
            setIsLoading(false);
            setHasInitialized(true);
          }
          return;
        }
        
        // Get customer's table - only once
        try {
          const tables = await fetchTablesByCustomerId(customer['Customer Id']);
          if (tables && tables.length > 0 && isActive) {
            setTableNumber(tables[0]['Table No'].toString());
          }
        } catch (tableError) {
          console.error("Error fetching table:", tableError);
        }
        
        // If we have a current order ID stored, fetch that specific order
        if (currentOrderId) {
          try {
            const order = await fetchOrderById(currentOrderId);
            if (order && !order['Payment Status'] && isActive) {
              setCurrentOrderData(order);
              
              // Check order status
              const status = await checkOrderStatus(order['Order Id']);
              if (isActive) {
                updateOrderStatus({
                  isServed: Boolean(status.isServed),
                  isPaid: Boolean(status.isPaid)
                });
                
                // Start polling for status changes
                stopPolling = startOrderStatusPolling(
                  order['Order Id'],
                  (status) => {
                    if (isActive) {
                      updateOrderStatus({
                        isServed: Boolean(status.isServed),
                        isPaid: Boolean(status.isPaid)
                      });
                    }
                  },
                  15000 // Check every 15 seconds
                );
              }
            }
          } catch (error) {
            console.error("Error fetching stored order:", error);
            // Clear invalid order ID
            if (isActive) setCurrentOrder(null);
          }
        } else {
          // Check for existing unpaid orders if no current order is stored
          try {
            const latestOrder = await getLatestCustomerOrder(customer['Customer Id']);
            if (latestOrder && !latestOrder['Payment Status'] && isActive) {
              setCurrentOrderData(latestOrder);
              setCurrentOrder(latestOrder['Order Id']);
              
              // Check status
              const status = await checkOrderStatus(latestOrder['Order Id']);
              if (isActive) {
                updateOrderStatus({
                  isServed: Boolean(status.isServed),
                  isPaid: Boolean(status.isPaid)
                });
                
                // Start polling for status changes
                stopPolling = startOrderStatusPolling(
                  latestOrder['Order Id'],
                  (status) => {
                    if (isActive) {
                      updateOrderStatus({
                        isServed: Boolean(status.isServed),
                        isPaid: Boolean(status.isPaid)
                      });
                    }
                  },
                  15000 // Check every 15 seconds
                );
              }
            }
          } catch (error) {
            console.error("Error fetching latest order:", error);
          }
        }
      } catch (error) {
        console.error('Error initializing cart:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    };
    
    initializeCart();
    
    return () => {
      isActive = false;
      if (stopPolling) stopPolling();
    };
  }, [currentOrderId, setCurrentOrder, updateOrderStatus, hasInitialized]);
  
  // Handle placing a new order OR adding to existing order
  const handleAction = async () => {
    try {
      setOrderError('');
      
      // Check if we have a table number
      if (!tableNumber) {
        setOrderError('Table number not found. Please contact staff for assistance.');
        return;
      }
      
      // Get current customer
      const customer = getCurrentCustomer();
      if (!customer) {
        router.push('/login?redirect=cart');
        return;
      }
      
      setIsPlacingOrder(true);
      
      // If this is a new order, create one
      if (!currentOrderId) {
        try {
          // Place a new order
          const newOrder = await placeOrderFromCart(
            cart, 
            tableNumber,
            customer['Customer Id']
          );
          
          if (newOrder && newOrder['Order Id']) {
            setCurrentOrderData(newOrder);
            setCurrentOrder(newOrder['Order Id']);
            updateOrderStatus({
              isServed: false,
              isPaid: false
            });
          } else {
            throw new Error("Failed to create order");
          }
        } catch (error) {
          console.error('Error placing new order:', error);
          setOrderError(error.message || 'Failed to place order. Please try again.');
          setIsPlacingOrder(false);
          return;
        }
      } 
      // If we have an existing order, add items to it
      else {
        try {
          const updatedOrder = await addItemsToOrder(
            currentOrderId,
            cart
          );
          
          if (updatedOrder) {
            setCurrentOrderData(updatedOrder);
            updateOrderStatus({
              ...orderStatus,
              isServed: false // Reset serving status when adding items
            });
            
            // Clear cart after successfully adding items to the order
            clearCart();
          } else {
            throw new Error("Failed to update order");
          }
        } catch (error) {
          console.error('Error adding to existing order:', error);
          setOrderError(error.message || 'Failed to update order. Please try again.');
          setIsPlacingOrder(false);
          return;
        }
      }
      
    } catch (error) {
      console.error('Error handling action:', error);
      setOrderError(error.message || 'Failed to complete action. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  // Handle payment processing
  const handleProcessPayment = async () => {
    try {
      setOrderError('');
      
      if (!currentOrderId) {
        setOrderError('No active order found');
        return;
      }
      
      setIsProcessingPayment(true);
      
      // Call the fixed processPayment function that only updates payment status
      await processPayment(currentOrderId);
      
      // Update order status to paid
      updateOrderStatus({
        ...orderStatus,
        isPaid: true
      });
      
      // Clear cart after successful payment
      clearCart();
      
      // Navigate to payment confirmation
      router.push(`/payment-confirmation?id=${currentOrderId}`);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setOrderError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
          
          {/* Order Status Indicator */}
          {currentOrderId && (
            <div className="ml-auto">
              <Chip 
                color={orderStatus.isPaid ? "success" : orderStatus.isServed ? "warning" : "primary"}
                variant="bordered"
                className="ml-2"
              >
                {orderStatus.isPaid 
                  ? "Paid" 
                  : orderStatus.isServed 
                    ? "Ready for Payment" 
                    : "Preparing"}
              </Chip>
            </div>
          )}
        </motion.div>
        
        {(cart.length === 0 && !currentOrderId) || (orderStatus.isPaid) ? (
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
              {orderStatus.isPaid 
                ? "Your order has been paid. Thank you!" 
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
                onClick={() => router.push('/')}
                size="lg"
                className="rounded-full px-8 font-medium shadow-lg bg-gray-800 text-white"
              >
                Browse Menu
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* Current Order Section */}
              {currentOrderId && currentOrder && (
                <motion.div 
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">Current Order</h2>
                    <Chip 
                      color={orderStatus.isServed ? "success" : "warning"}
                      size="sm"
                    >
                      {orderStatus.isServed ? "Food Served" : "Preparing"}
                    </Chip>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{currentOrder['Order Id']}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Table:</span>
                      <span className="font-medium">{currentOrder['Table No']}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{currentOrder.Amount || 0}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Cart Items Section */}
              {cart.length > 0 && (
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
                              <MinusIcon />
                            </motion.button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <motion.button 
                              className="px-2 py-1 text-gray-700"
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.dish['Dish Id'], item.quantity + 1)}
                            >
                              <PlusIcon />
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
              )}
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
                    
                    {/* Table Information - Not loading repeatedly now */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Your Table</span>
                      <span className="font-medium">
                        {isLoading ? (
                          <motion.div
                            animate={{ 
                              opacity: [0.5, 1, 0.5] 
                            }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="bg-gray-200 h-6 w-12 rounded"
                          />
                        ) : tableNumber ? (
                          `Table ${tableNumber}`
                        ) : (
                          <span className="text-red-500">Not found</span>
                        )}
                      </span>
                    </div>
                    
                    {/* Order Status Info */}
                    {currentOrderId && currentOrder && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-1">Order Status</div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${orderStatus.isServed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                          <span className="text-sm">{orderStatus.isServed ? 'Food Served' : 'Preparing'}</span>
                        </div>
                      </div>
                    )}
                    
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
                <CardFooter className="flex flex-col gap-2">
                  {/* Main Action Button - for PLACE ORDER or ADD TO ORDER */}
                  {cart.length > 0 && !orderStatus.isServed && (
                    <Button 
                      className="w-full py-6 font-bold text-base rounded-lg bg-gray-800 text-white"
                      onClick={handleAction}
                      disabled={isPlacingOrder || cart.length === 0 || isLoading || !tableNumber}
                      isLoading={isPlacingOrder}
                    >
                      {!currentOrderId ? "PLACE ORDER" : "ADD TO ORDER"}
                    </Button>
                  )}
                  
                  {/* Payment Button - only shows when food is served */}
                  {orderStatus.isServed && !orderStatus.isPaid && (
                    <Button 
                      className="w-full py-6 font-bold text-base rounded-lg bg-gray-800 text-white"
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment}
                      isLoading={isProcessingPayment}
                    >
                      PROCESS PAYMENT
                    </Button>
                  )}
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
                    <p className="text-sm text-blue-800">
                      {!tableNumber 
                        ? "Please log in and select a table before placing your order."
                        : orderStatus.isServed
                          ? "Your food has been served. Please process payment when ready."
                          : currentOrderId
                            ? "Your order is being prepared. You can add more items if needed."
                            : "Your order will be prepared and served at your table."}
                    </p>
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