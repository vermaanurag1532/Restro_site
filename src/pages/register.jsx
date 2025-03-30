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
  Progress,
  Tooltip
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { register } from '../services/api';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    'Customer Name': '',
    'Contact Number': '',
    'Email': '',
    'Password': '',
    'Images': []
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Contact Number' ? parseInt(value || '0', 10) : value
    }));

    // Update password strength when password changes
    if (name === 'Password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "error";
    if (passwordStrength <= 50) return "warning";
    if (passwordStrength <= 75) return "primary";
    return "success";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.Password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await register(formData);
      router.push('/login');
    } catch (error) {
      setError(error.message || 'Registration failed');
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
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout title="Register">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute left-[20%] top-[10%] w-[400px] h-[400px] rounded-full bg-primary-300/10 blur-3xl"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute right-[15%] bottom-[10%] w-[350px] h-[350px] rounded-full bg-pink-300/10 blur-3xl"
            animate={{ 
              x: [0, -20, 0], 
              y: [0, 15, 0] 
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut",
              delay: 0.5
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute left-[10%] bottom-[20%] w-[300px] h-[300px] rounded-full bg-blue-300/10 blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
              delay: 1
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
              Join our culinary community today
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="relative w-full"
          >
            <Card className="w-full shadow-2xl backdrop-blur-sm border border-white/20 bg-white/90 overflow-hidden">
              <CardHeader className="flex flex-col items-center gap-1 pt-8 pb-4">
                <motion.h2 
                  className="text-2xl font-bold text-center"
                  variants={itemVariants}
                >
                  Create Account
                </motion.h2>
                <motion.p 
                  className="text-sm text-gray-500 text-center"
                  variants={itemVariants}
                >
                  Sign up to start ordering
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
                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Input
                      name="Customer Name"
                      placeholder="Enter your full name"
                      value={formData['Customer Name']}
                      onChange={handleChange}
                      startContent={<FaUser className="text-gray-400 text-sm flex-shrink-0 mr-2" />}
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Input
                      name="Contact Number"
                      type="number"
                      placeholder="Enter your contact number"
                      value={formData['Contact Number'] || ''}
                      onChange={handleChange}
                      startContent={<FaPhone className="text-gray-400 text-sm flex-shrink-0 mr-2" />}
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Input
                      name="Email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.Email}
                      onChange={handleChange}
                      startContent={<FaEnvelope className="text-gray-400 text-sm flex-shrink-0 mr-2" />}
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Input
                      name="Password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.Password}
                      onChange={handleChange}
                      startContent={<FaLock className="text-gray-400 text-sm flex-shrink-0 mr-2" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus:border-primary transition-all duration-150 shadow-sm",
                        input: "text-base pl-1",
                      }}
                    />
                    {formData.Password && (
                      <div className="space-y-1 px-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Password strength:</span>
                          <span className={`text-xs font-semibold text-${getPasswordStrengthColor()}-500`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <Progress 
                          value={passwordStrength} 
                          color={getPasswordStrengthColor()} 
                          size="sm"
                          className="h-1"
                          aria-label="Password strength"
                        />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center text-xs">
                            {/[A-Z]/.test(formData.Password) ? 
                              <FaCheck className="text-success mr-1 text-xs" /> : 
                              <FaTimes className="text-error mr-1 text-xs" />}
                            <span>Uppercase letter</span>
                          </div>
                          <div className="flex items-center text-xs">
                            {/[0-9]/.test(formData.Password) ? 
                              <FaCheck className="text-success mr-1 text-xs" /> : 
                              <FaTimes className="text-error mr-1 text-xs" />}
                            <span>Number</span>
                          </div>
                          <div className="flex items-center text-xs">
                            {formData.Password.length >= 8 ? 
                              <FaCheck className="text-success mr-1 text-xs" /> : 
                              <FaTimes className="text-error mr-1 text-xs" />}
                            <span>Min. 8 characters</span>
                          </div>
                          <div className="flex items-center text-xs">
                            {/[^A-Za-z0-9]/.test(formData.Password) ? 
                              <FaCheck className="text-success mr-1 text-xs" /> : 
                              <FaTimes className="text-error mr-1 text-xs" />}
                            <span>Special character</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      startContent={<FaLock className="text-gray-400 text-sm flex-shrink-0 mr-2" />}
                      isRequired
                      variant="bordered"
                      size="lg"
                      color={confirmPassword && (confirmPassword === formData.Password ? "success" : "danger")}
                      classNames={{
                        inputWrapper: "border-gray-300 hover:border-primary focus:border-primary transition-all duration-150 shadow-sm",
                        input: "text-base pl-1",
                      }}
                      endContent={
                        confirmPassword ? (
                          confirmPassword === formData.Password ? (
                            <FaCheck className="text-success" />
                          ) : (
                            <Tooltip content="Passwords don't match">
                              <FaTimes className="text-danger" />
                            </Tooltip>
                          )
                        ) : null
                      }
                    />
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6"
                  >
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={loading}
                      className="w-full font-semibold"
                      size="lg"
                      radius="sm"
                      variant="shadow"
                      disableRipple
                    >
                      Create Account
                    </Button>
                  </motion.div>
                  
                  <motion.p 
                    variants={itemVariants}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className="text-center text-sm mt-2"
                  >
                    Already have an account?{' '}
                    <motion.span
                      whileHover={{ 
                        color: "#0070f3",
                        scale: 1.05
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link href="/login" className="text-primary font-semibold hover:underline">
                        Log In
                      </Link>
                    </motion.span>
                  </motion.p>
                </form>
              </CardBody>
            </Card>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-100 rounded-full opacity-50 blur-xl"></div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 text-center text-xs text-gray-500"
          >
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Register;