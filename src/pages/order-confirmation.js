import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Spinner, Divider } from '@nextui-org/react';
import Layout from '../components/Layout';
import { fetchOrderById } from '../services/api';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getOrderDetails() {
      if (!id) return;
      
      try {
        setLoading(true);
        const orderData = await fetchOrderById(id);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    getOrderDetails();
  }, [id]);

  // Format date string to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Layout title="Order Confirmation">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Order Confirmation">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center">
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto text-red-500 mb-4"
            >
              <path 
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path 
                d="M12 8V13" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M11.995 16H12.005" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              color="primary"
              onClick={() => router.push('/')}
            >
              Return to Menu
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Order Confirmation">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Order not found</h2>
            <p className="text-gray-600 mb-6">We couldn&apos;t find the order you&apos;re looking for.</p>
            <Button 
              color="primary"
              onClick={() => router.push('/')}
            >
              Return to Menu
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Order Confirmation">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-green-600"
            >
              <path 
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path 
                d="M7.75 12L10.58 14.83L16.25 9.17" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <motion.h1 
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Order Confirmed!
          </motion.h1>
          <motion.p 
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your order has been received and is being prepared.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Order Details</h2>
                <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
                  #{order['Order Id'] || id}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(order.Date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{order.Time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-medium">{order['Table No']}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="inline-flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 ${order['Serving Status'] ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      {order['Serving Status'] ? 'Served' : 'Being Prepared'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div className="p-4">
              <h3 className="font-bold mb-3">Order Items</h3>
              
              <div className="space-y-3">
                {order.Dishes && order.Dishes.map((dish, index) => (
                  <motion.div 
                    key={`${dish['Dish Id']}-${index}`}
                    className="flex justify-between items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                        {dish.Quantity}
                      </div>
                      <p>{dish.Name || `Dish ${dish['Dish Id']}`}</p>
                    </div>
                    {dish.Price && (
                      <p className="font-medium">₹{dish.Price * dish.Quantity}</p>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <Divider className="my-4" />
              
              <div className="flex justify-between items-center font-bold">
                <span>Total Amount</span>
                <span className="text-lg">₹{order.Amount}</span>
              </div>
            </div>
          </Card>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-3 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button
              variant="flat"
              color="primary"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              Order More
            </Button>
            <Button
              color="primary"
              className="flex-1"
              onClick={() => {
                // This would typically go to an order tracking page
                router.push('/orders');
              }}
            >
              Track Order
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="bg-gray-50 rounded-lg p-4 mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm text-gray-600">
            Having an issue with your order? Please contact our staff or call us at <span className="font-medium">+91 98765 43210</span>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;