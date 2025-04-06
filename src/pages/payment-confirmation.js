import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card, CardBody, Button, Spinner } from '@nextui-org/react';
import Layout from '../components/Layout';
import { fetchOrderById } from '../services/api';

const PaymentConfirmation = () => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Make sure we have the id and only fetch once when it's available
    if (!router.isReady) return;
    
    const orderId = router.query.id;
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    const getOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching order details for:', orderId);
        const orderData = await fetchOrderById(orderId);
        
        if (!orderData) {
          throw new Error(`Order ${orderId} not found`);
        }
        
        console.log('Order data received:', orderData);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();
  }, [router.isReady, router.query.id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <Layout title="Payment Confirmation">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Payment Confirmation">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="text-red-500 mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" fill="currentColor" fillOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            color="primary"
            onClick={() => router.push('/cart')}
          >
            Return to Cart
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment Confirmation">
      <div className="max-w-xl mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Success Icon */}
          <motion.div 
            className="flex justify-center mb-6"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" fill="currentColor" fillOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Title & Subtitle */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Thank you for dining with us. Your payment has been processed successfully.
            </p>
          </motion.div>

          {/* Order Card */}
          <motion.div
            variants={itemVariants}
          >
            <Card className="shadow-md mb-6">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{order && order['Order Id']}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-medium">{order && order['Table No']}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{order && order.Date}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{order && order.Time}</span>
                  </div>
                  
                  <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">₹{order && order.Amount}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Buttons */}
          <motion.div 
            className="flex flex-col space-y-3"
            variants={itemVariants}
          >
            <Button
              color="primary"
              size="lg"
              className="w-full font-medium"
              onClick={() => router.push('/')}
            >
              Return to Menu
            </Button>
            
            <Button
              variant="bordered"
              size="lg"
              className="w-full"
              onClick={() => router.push('/orders')}
            >
              View My Orders
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="mt-8 text-center text-sm text-gray-500"
            variants={itemVariants}
          >
            <p>A receipt has been sent to your email.</p>
            <p className="mt-1">Thank you for choosing RedLinear Restro.</p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PaymentConfirmation;