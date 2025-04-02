import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Input, 
  Button, 
  Divider,
  Checkbox
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const { redirect } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);
      authLogin(data);
      router.push(redirect || '/');
    } catch (error) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
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

  // Food-related decorative elements
  const FoodDecorative = () => (
    <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block overflow-hidden">
      <div className="relative w-full h-full">
        <motion.div 
          className="absolute top-20 right-20 opacity-60"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-500">
            <path d="M8.01 22h-.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M3 9.01V4.99C3 3.89 3.89 3 4.99 3h6.02C12.11 3 13 3.89 13 4.99v11.02c0 1.1-.89 1.99-1.99 1.99H4.99C3.89 18 3 17.11 3 16.01V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M3 14h5.4c.5 0 .9-.4.9-.9 0-.5-.4-.9-.9-.9H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M3 6h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M13 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M18 8v11c0 1.66 1.34 3 3 3 1.66 0 3-1.34 3-3V5c0-1.1-.9-2-2-2h-1c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute top-40 right-60 opacity-40"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
            <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10"></path>
            <path d="M13.5 8C15.985 8 18 9.79 18 12s-2.015 4-4.5 4S9 14.21 9 12s2.015-4 4.5-4z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10"></path>
            <path d="M16.5 20.5v-3M12 22v-3M7.5 20.5v-3M3.17 15.82l2.53-1.46M3.17 8.18l2.53 1.46M20.83 15.82l-2.53-1.46M20.83 8.18l-2.53 1.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-40 right-40 opacity-50"
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-400">
            <path d="M9.5 14h5M9.5 18.5h5M9.5 9.5h5M9.5 5h5M12 2v20M19 22H5c-2 0-3-1-3-3V5c0-2 1-3 3-3h14c2 0 3 1 3 3v14c0 2-1 3-3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </motion.div>
      </div>
    </div>
  );

  return (
    <Layout title="Login">
      <div className="min-h-screen w-full flex items-center justify-center md:justify-start md:pl-12 lg:pl-24 py-12 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-0"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute -left-[10%] -top-[15%] w-[500px] h-[500px] rounded-full bg-primary-300/10 blur-3xl"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute -right-[5%] bottom-[10%] w-[400px] h-[400px] rounded-full bg-orange-300/10 blur-3xl"
            animate={{ 
              x: [0, -20, 0], 
              y: [0, 20, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute left-[30%] top-[60%] w-[300px] h-[300px] rounded-full bg-blue-300/10 blur-3xl"
            animate={{ 
              x: [0, 15, 0], 
              y: [0, -15, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 7,
              ease: "easeInOut"
            }}
          ></motion.div>
        </div>
        
        {/* Decorative Food Icons */}
        <FoodDecorative />
        
        {/* Content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md z-10 relative"
        >
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">
              <motion.span 
                className="text-gray-800"
                animate={{ 
                  color: ["#1f2937", "#374151", "#1f2937"],
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Red
              </motion.span>
              <span className="text-gray-800">Linear</span>
            </h1>
            <motion.p 
              className="mt-3 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Your culinary journey awaits
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card 
              className="shadow-2xl backdrop-blur-sm border border-white/30 bg-white/95"
              isBlurred
              radius="lg"
            >
              <CardHeader className="flex flex-col items-center gap-1 pt-8 pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-2"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </motion.div>
                <motion.h2 
                  className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600"
                  variants={itemVariants}
                >
                  Welcome Back
                </motion.h2>
                <motion.p 
                  className="text-sm text-gray-500 text-center"
                  variants={itemVariants}
                >
                  Sign in to continue your experience
                </motion.p>
              </CardHeader>
              
              <Divider className="opacity-50" />
              
              <CardBody className="py-6 px-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-6"
                  >
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <motion.div variants={itemVariants}>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      startContent={
                        <FaEnvelope className="text-primary-500/70 text-sm flex-shrink-0 mr-2" />
                      }
                      onChange={(e) => setEmail(e.target.value)}
                      variant="bordered"
                      size="lg"
                      radius="lg"
                      isRequired
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus:border-primary group-focus:border-primary transition-all duration-150 shadow-sm",
                        input: "text-base pl-1",
                      }}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      startContent={
                        <FaLock className="text-primary-500/70 text-sm flex-shrink-0 mr-2" />
                      }
                      onChange={(e) => setPassword(e.target.value)}
                      variant="bordered"
                      size="lg"
                      radius="lg"
                      isRequired
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus:border-primary group-focus:border-primary transition-all duration-150 shadow-sm",
                        input: "text-base pl-1",
                      }}
                    />
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-between items-center"
                  >
                    <Checkbox
                      size="sm"
                      isSelected={rememberMe}
                      onValueChange={setRememberMe}
                      color="primary"
                      classNames={{
                        label: "pl-2" // Add left padding to the label
                      }}
                    >
                      <span className="text-sm">Remember me</span>
                    </Checkbox>
                    <motion.div
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                        Forgot password?
                      </Link>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2"
                  >
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={loading}
                      className="w-full font-semibold text-black"
                      size="lg"
                      radius="lg"
                      variant="shadow"
                    >
                      <motion.span
                        animate={{ 
                          textShadow: loading ? "none" : "0px 1px 2px rgba(255,255,255,0.3)"
                        }}
                      >
                        Sign In
                      </motion.span>
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-center my-1"
                  >
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <p className="mx-4 text-sm text-gray-500">or continue with</p>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex gap-4 mt-1"
                  >
                    <Button
                      className="flex-1 bg-white border-2 border-gray-200"
                      variant="bordered"
                      radius="lg"
                      startContent={<FaGoogle className="text-red-500" />}
                    >
                      <span className="text-gray-700">Google</span>
                    </Button>
                    <Button
                      className="flex-1 bg-white border-2 border-gray-200"
                      variant="bordered"
                      radius="lg"
                      startContent={<FaFacebook className="text-blue-600" />}
                    >
                      <span className="text-gray-700">Facebook</span>
                    </Button>
                  </motion.div>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="text-center text-sm mt-4"
                  >
                    Don't have an account?{' '}
                    <motion.span
                      whileHover={{ 
                        color: "#0070f3",
                        scale: 1.05 
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link href="/register" className="text-primary font-semibold hover:underline">
                        Register Now
                      </Link>
                    </motion.span>
                  </motion.p>
                </form>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-xs text-gray-500"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              By logging in, you agree to our Terms of Service and Privacy Policy
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;