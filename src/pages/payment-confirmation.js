import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  Button, 
  Spinner, 
  Textarea, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Chip,
  Divider
} from '@nextui-org/react';
import Layout from '../components/Layout';
import { fetchOrderById, submitFeedback } from '../services/api';

const PaymentConfirmation = () => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
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

  const handleFeedbackSubmit = async () => {
    // Allow submission if there's either feedback text or rating
    if (!feedback.trim() && rating === 0) {
      return;
    }

    setSubmittingFeedback(true);
    try {
      let feedbackText = '';
      
      if (rating > 0 && feedback.trim()) {
        feedbackText = `Rating: ${rating}/5 stars\n${feedback.trim()}`;
      } else if (rating > 0) {
        feedbackText = `Rating: ${rating}/5 stars`;
      } else {
        feedbackText = feedback.trim();
      }
      
      await submitFeedback({
        orderId: order['Order Id'],
        customerId: order['Customer Id'],
        feedback: feedbackText
      });
      
      setFeedbackSubmitted(true);
      setFeedback('');
      setRating(0);
      onOpenChange(); // Close modal
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // You might want to show an error toast here
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Star rating component
  const StarRating = ({ rating, setRating, size = 24 }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-all duration-200 hover:scale-110"
          >
            <svg
              width={size}
              height={size}
              fill={star <= rating ? "#fbbf24" : "#e5e7eb"}
              viewBox="0 0 24 24"
              className="transition-colors duration-200"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

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
          <Spinner size="lg" color="success" />
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Success Icon */}
          <motion.div 
            className="flex justify-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" fill="currentColor" fillOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Title & Subtitle */}
          <motion.div 
            className="text-center mb-10"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for dining with us. Your payment has been processed successfully.
            </p>
            <Chip color="success" variant="flat" className="mt-3">
              Order Completed
            </Chip>
          </motion.div>

          {/* Order Card */}
          <motion.div
            variants={itemVariants}
          >
            <Card className="shadow-lg mb-8 border border-gray-100">
              <CardBody className="p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-primary">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Order Summary
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Order ID:</span>
                      <Chip variant="flat" color="primary" size="sm">
                        {order && order['Order Id']}
                      </Chip>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Table:</span>
                      <span className="font-semibold text-lg">{order && order['Table No']}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Date:</span>
                      <span className="font-semibold">{order && order.Date}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Time:</span>
                      <span className="font-semibold">{order && order.Time}</span>
                    </div>
                  </div>
                </div>
                
                <Divider className="my-6" />
                
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total Amount:</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₹{order && order.Amount}</div>
                    <div className="text-sm text-gray-500">Paid Successfully</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            variants={itemVariants}
          >
            <AnimatePresence>
              {!feedbackSubmitted && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <Card className="shadow-md border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                    <CardBody className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M8 12H16M8 16H16M8 8H16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Share Your Experience</h3>
                        <p className="text-gray-600">
                          Help us improve! Your feedback helps us serve you better.
                        </p>
                        <Chip color="primary" variant="flat" size="sm" className="mt-2">
                          Optional
                        </Chip>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button
                          color="primary"
                          size="lg"
                          onPress={onOpen}
                          className="px-8 font-semibold"
                          startContent={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          }
                        >
                          Write Feedback
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
              
              {feedbackSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <Card className="shadow-md border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardBody className="p-8">
                      <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-green-800 text-lg">Thank you for your feedback!</h3>
                          <p className="text-green-700">Your feedback helps us serve you better.</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="grid md:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold h-14"
              onClick={() => router.push('/')}
              startContent={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L21 12M3 6L21 6M3 18L21 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            >
              Return to Menu
            </Button>
            
            <Button
              variant="bordered"
              size="lg"
              className="w-full font-semibold h-14"
              onClick={() => router.push('/orders')}
              startContent={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            >
              View My Orders
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="mt-10 text-center"
            variants={itemVariants}
          >
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-center mb-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-gray-600 font-medium">A receipt has been sent to your email.</p>
              <p className="text-gray-500 text-sm mt-1">Thank you for choosing RedLinear Restro.</p>
            </div>
          </motion.div>
        </motion.div>

{/* Enhanced Professional Feedback Modal */}
<Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="center"
          backdrop="blur"
          size="4xl"
          scrollBehavior="inside"
          classNames={{
            modal: "mx-4 max-h-[95vh] bg-white",
            backdrop: "bg-black/50 backdrop-blur-sm",
            body: "p-0 overflow-hidden",
            header: "px-0 pb-0 border-b-0",
            footer: "px-0 pt-0 border-t-0",
            closeButton: "top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600"
          }}
        >
          <ModalContent className="overflow-hidden">
            {(onClose) => (
              <>
                {/* Fixed Header */}
                <ModalHeader className="sticky top-0 z-20 bg-white border-b border-gray-100 px-8 py-6">
                  <div className="flex items-center w-full">
                    <div className="flex items-center flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          Share Your Experience
                        </h2>
                        <p className="text-gray-600 text-sm font-medium">
                          Help us serve you better • Order #{order && order['Order Id']}
                        </p>
                      </div>
                    </div>
                  </div>
                </ModalHeader>

                {/* Scrollable Body */}
                <ModalBody className="px-8 py-0 max-h-[calc(95vh-180px)] overflow-y-auto">
                  <div className="space-y-8 py-6">
                    {/* Order Context Card */}
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">Table {order && order['Table No']}</p>
                            <p className="text-gray-600 text-sm">{order && order.Date} • {order && order.Time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{order && order.Amount}</p>
                          <p className="text-sm text-gray-500">Total Amount</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Rate Your Overall Experience
                        </h3>
                        <p className="text-gray-600 mb-8">
                          Your rating helps us understand how we're doing
                        </p>
                        
                        <div className="flex justify-center items-center gap-3 mb-6">
                          <StarRating rating={rating} setRating={setRating} size={48} />
                        </div>
                        
                        <div className="min-h-[60px] flex items-center justify-center">
                          {rating === 0 && (
                            <div className="flex items-center text-gray-400">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                                <path d="M8 14S9.5 16 12 16S16 14 16 14M9 9H9.01M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-sm font-medium">Click a star to rate your experience</span>
                            </div>
                          )}
                          {rating === 1 && (
                            <div className="flex items-center text-red-500 bg-red-50 px-4 py-2 rounded-full">
                              <span className="text-2xl mr-2">😞</span>
                              <span className="font-semibold">Poor - We can do better</span>
                            </div>
                          )}
                          {rating === 2 && (
                            <div className="flex items-center text-orange-500 bg-orange-50 px-4 py-2 rounded-full">
                              <span className="text-2xl mr-2">😐</span>
                              <span className="font-semibold">Fair - Room for improvement</span>
                            </div>
                          )}
                          {rating === 3 && (
                            <div className="flex items-center text-amber-500 bg-amber-50 px-4 py-2 rounded-full">
                              <span className="text-2xl mr-2">🙂</span>
                              <span className="font-semibold">Good - Meeting expectations</span>
                            </div>
                          )}
                          {rating === 4 && (
                            <div className="flex items-center text-blue-500 bg-blue-50 px-4 py-2 rounded-full">
                              <span className="text-2xl mr-2">😊</span>
                              <span className="font-semibold">Great - Exceeding expectations</span>
                            </div>
                          )}
                          {rating === 5 && (
                            <div className="flex items-center text-green-500 bg-green-50 px-4 py-2 rounded-full">
                              <span className="text-2xl mr-2">🤩</span>
                              <span className="font-semibold">Excellent - Outstanding experience!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Feedback Tags */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        What stood out? <span className="text-gray-400 font-normal text-base">(Optional)</span>
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Select all that apply to help us understand your experience better
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { icon: '🍽️', text: 'Amazing food', category: 'food' },
                          { icon: '⚡', text: 'Quick service', category: 'service' },
                          { icon: '😊', text: 'Friendly staff', category: 'service' },
                          { icon: '🏛️', text: 'Great atmosphere', category: 'ambiance' },
                          { icon: '💰', text: 'Good value', category: 'value' },
                          { icon: '🎯', text: 'Will recommend', category: 'overall' },
                          { icon: '🍷', text: 'Great drinks', category: 'food' },
                          { icon: '🧹', text: 'Clean & hygienic', category: 'ambiance' },
                          { icon: '📍', text: 'Perfect location', category: 'overall' }
                        ].map((option) => {
                          const isSelected = feedback.includes(option.text);
                          return (
                            <button
                              key={option.text}
                              onClick={() => {
                                if (isSelected) {
                                  setFeedback(feedback.replace(option.text, '').replace(/\n\n/g, '\n').trim());
                                } else {
                                  setFeedback(feedback ? `${feedback}\n${option.text}` : option.text);
                                }
                              }}
                              className={`
                                flex items-center justify-start px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105
                                ${isSelected 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <span className="text-xl mr-3">{option.icon}</span>
                              <span className="font-medium text-sm">{option.text}</span>
                              {isSelected && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-auto text-blue-500">
                                  <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Feedback */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tell us more <span className="text-gray-400 font-normal text-base">(Optional)</span>
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Share specific details about your experience to help us improve
                      </p>
                      
                      <div className="relative">
                        <Textarea
                          placeholder="What did you love most? Any suggestions for improvement? How was the food quality, service speed, staff behavior, or restaurant ambiance?"
                          value={feedback}
                          onValueChange={setFeedback}
                          minRows={4}
                          maxRows={8}
                          maxLength={1000}
                          className="w-full"
                          classNames={{
                            input: "text-base leading-relaxed resize-none",
                            inputWrapper: "border-2 border-gray-200 hover:border-gray-300 focus-within:border-blue-500 transition-colors duration-200 rounded-xl bg-gray-50 focus-within:bg-white"
                          }}
                        />
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center text-gray-500 text-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                              <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Your feedback is confidential and helps us improve
                          </div>
                          <span className="text-sm text-gray-400 font-mono">
                            {feedback.length}/1000
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Privacy & Thank You */}
                    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border border-green-200/50">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900 text-lg mb-2">
                            Thank you for helping us improve!
                          </h4>
                          <p className="text-green-800 leading-relaxed">
                            Your feedback is reviewed by our management team and directly influences how we enhance our service, food quality, and overall dining experience. We value your honest opinion and use it to make meaningful improvements.
                          </p>
                          <div className="flex items-center mt-3 text-green-700 text-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                              <path d="M12 22S8 18 8 13C8 7.477 10.477 3 16 3S24 7.477 24 13C24 18 20 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Your privacy is protected - feedback is kept confidential
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalBody>

                {/* Fixed Footer */}
                <ModalFooter className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-6">
                  <div className="flex w-full gap-4">
                    <Button 
                      color="default" 
                      variant="bordered" 
                      onPress={onClose}
                      disabled={submittingFeedback}
                      className="font-semibold flex-1 h-12 border-2 border-gray-200 hover:border-gray-300 text-gray-600"
                      size="lg"
                    >
                      Skip for now
                    </Button>
                    <Button 
                      color="primary" 
                      onPress={handleFeedbackSubmit}
                      disabled={submittingFeedback || (feedback.trim() === '' && rating === 0)}
                      isLoading={submittingFeedback}
                      className="font-semibold flex-2 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      size="lg"
                      startContent={!submittingFeedback && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                        </svg>
                      )}
                    >
                      {submittingFeedback ? 'Submitting feedback...' : 'Submit Feedback'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-3 w-full">
                    You can submit with just a rating, just text, or both
                  </p>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
};

export default PaymentConfirmation;