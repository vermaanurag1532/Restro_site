import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tab, Tabs, Card, Avatar, Badge, Button, Spinner, Divider } from '@nextui-org/react';
import Layout from '../components/Layout';
import { getCurrentCustomer, fetchOrdersByCustomerId, logout } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Get customer data from cookie/localStorage
    const loadCustomer = async () => {
      try {
        setLoading(true);
        const currentCustomer = getCurrentCustomer();
        
        if (!currentCustomer) {
          router.push('/login?redirect=profile');
          return;
        }
        
        setCustomer(currentCustomer);
      } catch (err) {
        console.error('Error loading customer:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomer();
  }, [router]);
  
  useEffect(() => {
    // Fetch customer orders
    const loadOrders = async () => {
      if (!customer) return;
      
      try {
        setOrderLoading(true);
        const customerOrders = await fetchOrdersByCustomerId(customer['Customer Id']);
        setOrders(customerOrders || []);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setOrderLoading(false);
      }
    };
    
    loadOrders();
  }, [customer]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time to 12-hour format
  const formatTime = (timeString) => {
    try {
      // Handle different time formats
      let hours, minutes;
      
      if (timeString.includes(':')) {
        [hours, minutes] = timeString.split(':').map(Number);
      } else {
        hours = Math.floor(timeString / 100);
        minutes = timeString % 100;
      }
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };
  
  if (loading) {
    return (
      <Layout title="Profile">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Profile">
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

  if (!customer) {
    return (
      <Layout title="Profile">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Profile not found</h2>
            <p className="text-gray-600 mb-6">Please login to view your profile.</p>
            <Button 
              color="primary"
              onClick={() => router.push('/login?redirect=profile')}
            >
              Login
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <motion.div 
            className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Avatar 
                src={customer.Images && customer.Images.length > 0 && customer.Images[0] 
                  ? customer.Images[0] 
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer['Customer Name'])}&background=random`
                }
                className="w-24 h-24 text-large"
                showFallback
                radius="full"
                size="lg"
              />
              <Badge 
                content="✓" 
                color="success" 
                placement="bottom-right"
                className="border-2 border-white"
                size="lg"
              />
            </motion.div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{customer['Customer Name']}</h1>
              <p className="text-gray-500 mb-2">{customer.Email}</p>
              <p className="text-gray-500 mb-4">+{customer['Contact Number']}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onClick={() => router.push('/edit-profile')}
                >
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Tabs 
            aria-label="Profile tabs" 
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            className="mb-6"
            color="primary"
            variant="underlined"
          >
            <Tab key="profile" title="Profile Info">
              <AnimatePresence mode="wait">
                <motion.div
                  key="profile-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{customer['Customer Name']}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{customer.Email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">+{customer['Contact Number']}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer ID</p>
                        <p className="font-medium">{customer['Customer Id']}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 mt-4">
                    <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-gray-500">Update your password</p>
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onClick={() => router.push('/change-password')}
                        >
                          Change
                        </Button>
                      </div>
                      
                      <Divider />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-gray-500">Permanently delete your account</p>
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </Tab>
            
            <Tab key="orders" title={`My Orders (${orders.length})`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key="orders-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {orderLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Spinner size="lg" color="primary" />
                      <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg 
                        width="60" 
                        height="60" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto text-gray-400 mb-4"
                      >
                        <path 
                          d="M7.5 7.67V6.7c0-2.25 1.81-4.46 4.06-4.67a4.5 4.5 0 0 1 4.94 4.48v1.38M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22Z" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                      <Button
                        color="primary"
                        onClick={() => router.push('/')}
                      >
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {orders.map((order, index) => (
                        <motion.div 
                          key={order['Order Id'] || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          whileHover={{ 
                            y: -4,
                            boxShadow: "0 10px 20px rgba(0,0,0,0.1)" 
                          }}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/order-confirmation?id=${order['Order Id']}`)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
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
                                  </svg>
                                  <h3 className="font-semibold">RedLinear Restro</h3>
                                </div>
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <span className="mr-3">{formatDate(order.Date)}</span>
                                  <span>{formatTime(order.Time)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full font-medium">
                                  #{order['Order Id'].split('-')[1]}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Table</p>
                                <p className="font-medium">{order['Table No']}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Amount</p>
                                <p className="font-bold text-primary">₹{order.Amount}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <div className="flex items-center">
                                  <span 
                                    className={`w-2 h-2 rounded-full mr-1 ${
                                      order['Serving Status'] 
                                        ? 'bg-green-500' 
                                        : order['Payment Status'] 
                                          ? 'bg-yellow-500' 
                                          : 'bg-blue-500'
                                    }`}
                                  ></span>
                                  <span className="text-sm font-medium">
                                    {order['Serving Status'] 
                                      ? 'Served' 
                                      : order['Payment Status'] 
                                        ? 'Preparing' 
                                        : 'Ordered'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <Divider className="my-3" />
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <svg 
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-gray-500 mr-1"
                                >
                                  <path 
                                    d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z" 
                                    stroke="currentColor" 
                                    strokeWidth="1.5" 
                                    strokeMiterlimit="10" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                  />
                                </svg>
                                <span className="text-sm text-gray-500">
                                  {(order.Dishes || []).length} items
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Here you could implement a reorder functionality
                                  // This would typically clone the order items to a new cart
                                }}
                              >
                                Reorder
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Tab>
            
            <Tab key="addresses" title="Addresses">
              <AnimatePresence mode="wait">
                <motion.div
                  key="addresses-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg 
                      width="60" 
                      height="60" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto text-gray-400 mb-4"
                    >
                      <path 
                        d="M12 13.43C13.7231 13.43 15.12 12.0331 15.12 10.31C15.12 8.58687 13.7231 7.19 12 7.19C10.2769 7.19 8.88 8.58687 8.88 10.31C8.88 12.0331 10.2769 13.43 12 13.43Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                      />
                      <path 
                        d="M3.62 8.49C5.59 -0.169 18.42 -0.159 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.39 20.54C5.63 17.88 2.47 13.57 3.62 8.49Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                      />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                    <p className="text-gray-500 mb-4">You haven't saved any delivery addresses yet.</p>
                    <Button
                      color="primary"
                      onClick={() => router.push('/add-address')}
                    >
                      Add New Address
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Tab>
          </Tabs>
        </motion.div>
        
        {/* Quick Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-primary-50 p-4 rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
            >
              <h3 className="text-sm text-gray-600 mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-primary">{orders.length}</p>
            </motion.div>
            
            <motion.div 
              className="bg-success-50 p-4 rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
            >
              <h3 className="text-sm text-gray-600 mb-1">Completed</h3>
              <p className="text-2xl font-bold text-success">
                {orders.filter(order => order['Serving Status']).length}
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-warning-50 p-4 rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
            >
              <h3 className="text-sm text-gray-600 mb-1">In Progress</h3>
              <p className="text-2xl font-bold text-warning">
                {orders.filter(order => !order['Serving Status'] && order['Payment Status']).length}
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-blue-50 p-4 rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
            >
              <h3 className="text-sm text-gray-600 mb-1">Total Spent</h3>
              <p className="text-2xl font-bold text-blue-600">
                ₹{orders.reduce((total, order) => total + (order.Amount || 0), 0)}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;