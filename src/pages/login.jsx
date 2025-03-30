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
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

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
      router.push('/');
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

  return (
    <Layout title="Login">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200/30 via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute -left-[10%] -top-[15%] w-[500px] h-[500px] rounded-full bg-primary-300/20 blur-3xl"
            animate={{ 
              x: [0, 10, 0], 
              y: [0, -10, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute -right-[5%] bottom-[10%] w-[300px] h-[300px] rounded-full bg-rose-300/20 blur-3xl"
            animate={{ 
              x: [0, -10, 0], 
              y: [0, 10, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut"
            }}
          ></motion.div>
        </div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md z-10"
        >
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-800"
                animate={{ 
                  backgroundPosition: ["0% center", "100% center", "0% center"],
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
              className="w-full shadow-2xl backdrop-blur-sm border border-white/20 bg-white/90"
              isBlurred
            >
              <CardHeader className="flex flex-col items-center gap-1 pt-8 pb-4">
                <motion.h2 
                  className="text-2xl font-bold text-center"
                  variants={itemVariants}
                >
                  Welcome Back
                </motion.h2>
                <motion.p 
                  className="text-sm text-gray-500 text-center"
                  variants={itemVariants}
                >
                  Sign in to your account
                </motion.p>
              </CardHeader>
              
              <Divider />
              
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
                        <FaEnvelope className="text-gray-400 text-sm flex-shrink-0 mr-2" />
                      }
                      onChange={(e) => setEmail(e.target.value)}
                      variant="bordered"
                      size="lg"
                      isRequired
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus:border-primary transition-all duration-150 shadow-sm",
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
                        <FaLock className="text-gray-400 text-sm flex-shrink-0 mr-2" />
                      }
                      onChange={(e) => setPassword(e.target.value)}
                      variant="bordered"
                      size="lg"
                      isRequired
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus:border-primary transition-all duration-150 shadow-sm",
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
                    >
                      <span className="text-sm">Remember me</span>
                    </Checkbox>
                    <motion.div
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="#" className="text-primary text-sm hover:underline">
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
                      className="w-full font-semibold"
                      size="lg"
                      radius="sm"
                      variant="shadow"
                    >
                      <motion.span
                        animate={{ 
                          color: loading ? "#ffffff" : "#ffffff"
                        }}
                      >
                        Sign In
                      </motion.span>
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