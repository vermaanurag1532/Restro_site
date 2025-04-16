import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { login, fetchAvailableTables, updateTable } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from '../styles/login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [fetchingTables, setFetchingTables] = useState(true);
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const { redirect } = router.query;

  // Add a state to track animation completion
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Fetch available tables when component loads
  useEffect(() => {
    const loadAvailableTables = async () => {
      try {
        setFetchingTables(true);
        const tables = await fetchAvailableTables();
        setAvailableTables(tables);
      } catch (error) {
        console.error('Error fetching available tables:', error);
        setError('Could not load available tables. Please try again later.');
      } finally {
        setFetchingTables(false);
      }
    };

    loadAvailableTables();
  }, []);

  // Simulate animation completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationCompleted(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!tableNo) {
      setError('Please select a table number');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // First, login the customer
      const customerData = await login(email, password);
      
      console.log('Customer data after login:', customerData);
      const customerId = customerData['Customer Id'];
      
      // Ensure we have a valid customer ID before updating the table
      if (!customerId) {
        console.error('No valid customer ID found in login response');
        setError('Authentication successful but customer data is incomplete');
        return;
      }
      
      // Assign the customer to the selected table
      try {
        console.log(`Updating table ${tableNo} with customer ID ${customerId}`);
        const tableUpdateResult = await updateTable(tableNo, customerId);
        console.log('Table update result:', tableUpdateResult);
      } catch (updateError) {
        console.error(`Error updating table ${tableNo}:`, updateError);
        // Show a warning but continue with login
        setError(`Logged in successfully but could not reserve table ${tableNo}. Please try again or contact support.`);
        
        // Continue with login process despite the table update error
        authLogin(customerData);
        router.push(redirect || '/');
        return;
      }
      
      // Complete the login process
      authLogin(customerData);
      
      // Navigate to the redirect URL or home page
      router.push(redirect || '/');
    } catch (error) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Layout title="Login">
      <div className={styles.loginContainer}>
        {/* Background elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.gradientBg}></div>
          
          {/* Abstract background shapes */}
          <div className={styles.shapesContainer}>
            <div className={styles.shape1}></div>
            <div className={styles.shape2}></div>
            <div className={styles.shape3}></div>
            <div className={styles.shape4}></div>
            <div className={styles.shape5}></div>
          </div>
          
          {/* Animated food illustrations */}
          <div className={styles.illustration1}>
            <svg width="240" height="240" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g className={styles.plateGroup}>
                {/* Plate */}
                <ellipse cx="50" cy="70" rx="40" ry="10" fill="url(#plate-gradient)" />
                <ellipse cx="50" cy="68" rx="30" ry="8" fill="white" fillOpacity="0.7" />
                
                {/* Food items */}
                <g className={styles.foodItems}>
                  {/* Main dish */}
                  <path d="M40 50C40 50 43 40 50 40C57 40 60 50 60 50L57 65H43L40 50Z" fill="#FF8A65" />
                  <path d="M45 50C45 50 47 45 50 45C53 45 55 50 55 50L53 60H47L45 50Z" fill="#FFCCBC" />
                  
                  {/* Garnish */}
                  <circle className={styles.garnish1} cx="43" cy="45" r="3" fill="#AED581" />
                  <circle className={styles.garnish2} cx="58" cy="43" r="2" fill="#AED581" />
                  <circle className={styles.garnish3} cx="53" cy="38" r="2.5" fill="#AED581" />
                </g>
                
                {/* Steam animation */}
                <path className={styles.steam1} d="M45 38C45 38 42 32 45 28C48 24 51 27 50 30C49 33 52 34 54 31C56 28 54 22 57 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path className={styles.steam2} d="M55 36C55 36 58 31 56 27C54 23 57 20 60 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path className={styles.steam3} d="M50 34C50 34 48 29 50 26C52 23 53 24 52 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              
              {/* Utensils */}
              <g className={styles.utensils}>
                <path d="M68 40C68 40 70 50 70 60C70 65 68 70 68 70" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M32 40C32 40 30 45 30 55C30 60 30 65 33 70" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M27 45C27 45 27 58 30 65" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M24 42C24 42 25 56 28 63" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              
              {/* Definitions */}
              <defs>
                <linearGradient id="plate-gradient" x1="30" y1="65" x2="70" y2="75" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E0E0E0" />
                  <stop offset="1" stopColor="#BDBDBD" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className={styles.illustration2}>
            <svg width="160" height="160" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Wine glass */}
              <g className={styles.wineGlass}>
                <path d="M45 30C45 30 35 40 35 50C35 60 40 65 50 65C60 65 65 60 65 50C65 40 55 30 55 30H45Z" fill="url(#wine-gradient)" fillOpacity="0.9" />
                <path d="M45 30H55" stroke="#E0E0E0" strokeWidth="0.5" />
                <path d="M50 65V85" stroke="#E0E0E0" strokeWidth="1.5" />
                <path d="M40 85H60" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Glass highlights */}
                <path d="M40 40C40 40 45 43 50 43C55 43 60 40 60 40" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" />
                <path d="M38 35L52 32" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" />
              </g>
              
              {/* Wine bubbles */}
              <circle className={styles.bubble1} cx="45" cy="45" r="1" fill="white" />
              <circle className={styles.bubble2} cx="48" cy="50" r="1.5" fill="white" />
              <circle className={styles.bubble3} cx="52" cy="47" r="1" fill="white" />
              <circle className={styles.bubble4} cx="43" cy="55" r="1" fill="white" />
              <circle className={styles.bubble5} cx="54" cy="58" r="1.2" fill="white" />
              <circle className={styles.bubble6} cx="47" cy="60" r="0.8" fill="white" />
              
              {/* Definitions */}
              <defs>
                <linearGradient id="wine-gradient" x1="35" y1="35" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D32F2F" />
                  <stop offset="1" stopColor="#B71C1C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className={styles.illustration3}>
            <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Floating cutlery */}
              <g className={styles.cutlerySet}>
                {/* Fork */}
                <g className={styles.fork} transform="translate(20, 30) rotate(-30)">
                  <path d="M0 0C0 0 1 10 1 20C1 30 0 50 0 50" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" />
                  <path d="M-3 0V15" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 0V15" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 0V15" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" />
                </g>
                
                {/* Knife */}
                <g className={styles.knife} transform="translate(60, 40) rotate(20)">
                  <path d="M0 0C0 0 -1 30 0 50" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 0C0 0 15 5 15 15C15 25 0 30 0 30" fill="#E0E0E0" />
                </g>
                
                {/* Spoon */}
                <g className={styles.spoon} transform="translate(70, 25) rotate(-10)">
                  <path d="M0 0C0 0 1 20 0 50" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="0" cy="-5" rx="8" ry="12" transform="rotate(-15)" fill="#E0E0E0" />
                </g>
              </g>
            </svg>
          </div>
        </div>
        
        {/* Content */}
        <div className={styles.contentWrapper}>
          <div className={styles.logoSection} data-animated={animationCompleted}>
            <div className={styles.logoContainer}>
              <span className={styles.logoRed}>Red</span>
              <span className={styles.logoLinear}>Linear</span>
            </div>
            <p className={styles.tagline}>Your culinary journey awaits</p>
          </div>
          
          <div className={styles.cardContainer} data-animated={animationCompleted}>
            <div className={styles.cardWrapper}>
              {/* Card header with animated elements */}
              <div className={styles.cardHeader}>
                <div className={styles.userIconContainer}>
                  <div className={styles.iconPulse}></div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.userIcon}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className={styles.welcomeTitle}>Welcome Back</h2>
                <p className={styles.welcomeSubtitle}>Sign in to continue your experience</p>
              </div>
              
              {/* Animated divider */}
              <div className={styles.dividerContainer}>
                <div className={styles.divider}></div>
                <div className={styles.dividerHighlight}></div>
              </div>
              
              <div className={styles.cardBody}>
                {error && (
                  <div className={styles.errorContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.errorIcon}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                  {/* Email input with floating animation */}
                  <div className={styles.inputGroup}>
                    <div className={`${styles.inputWrapper} ${email ? styles.hasValue : ''}`}>
                      <label className={styles.inputLabel}>Email</label>
                      <div className={styles.inputIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.inputField}
                        required
                      />
                      <div className={styles.inputBorder}></div>
                      <div className={styles.inputFocusBorder}></div>
                    </div>
                  </div>
                  
                  {/* Password input with toggle visibility */}
                  <div className={styles.inputGroup}>
                    <div className={`${styles.inputWrapper} ${password ? styles.hasValue : ''}`}>
                      <label className={styles.inputLabel}>Password</label>
                      <div className={styles.inputIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.inputField}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={styles.passwordToggle}
                        tabIndex="-1"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                      <div className={styles.inputBorder}></div>
                      <div className={styles.inputFocusBorder}></div>
                    </div>
                  </div>
                  
                  {/* Table selection dropdown with available tables */}
                  <div className={styles.inputGroup}>
                    <div className={`${styles.inputWrapper} ${tableNo ? styles.hasValue : ''}`}>
                      <label className={styles.inputLabel}>Table Number</label>
                      <div className={styles.inputIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                      <select
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                        className={styles.inputField}
                        required
                        disabled={fetchingTables}
                      >
                        <option value="">Select a table</option>
                        {availableTables.map((table) => (
                          <option key={table['Table No']} value={table['Table No']}>
                            Table {table['Table No']}
                          </option>
                        ))}
                      </select>
                      {fetchingTables && (
                        <div className={styles.selectLoading}>
                          <div className={styles.loadingSpinner}></div>
                        </div>
                      )}
                      {availableTables.length === 0 && !fetchingTables && (
                        <div className={styles.noTablesMessage}>
                          No tables available at the moment
                        </div>
                      )}
                      <div className={styles.inputBorder}></div>
                      <div className={styles.inputFocusBorder}></div>
                    </div>
                  </div>
                  
                  {/* Options row with custom checkbox */}
                  <div className={styles.optionsRow}>
                    <label className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkmarkBox}>
                        <svg className={styles.checkmarkIcon} viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      <span className={styles.checkboxLabel}>Remember me</span>
                    </label>
                    
                    <Link href="/forgot-password" className={styles.forgotPassword}>
                      Forgot password?
                    </Link>
                  </div>
                  
                  {/* Sign in button with animation effects */}
                  <button type="submit" className={`${styles.signInButton} ${loading ? styles.loading : ''}`}>
                    <div className={styles.buttonBg}></div>
                    <span className={styles.buttonText}>
                      {loading ? (
                        <div className={styles.loadingContainer}>
                          <div className={styles.loadingDot}></div>
                          <div className={styles.loadingDot}></div>
                          <div className={styles.loadingDot}></div>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </span>
                    <div className={styles.buttonHighlight}></div>
                  </button>

                  {/* Or divider with animated gradients */}
                  <div className={styles.orDivider}>
                    <div className={styles.dividerLineLeft}></div>
                    <div className={styles.dividerGlow}></div>
                    <span className={styles.dividerText}>or continue with</span>
                    <div className={styles.dividerLineRight}></div>
                    <div className={styles.dividerGlow}></div>
                  </div>

                  {/* Social login buttons with hover effects */}
                  <div className={styles.socialButtons}>
                    <button type="button" className={`${styles.socialButton} ${styles.googleButton}`}>
                      <div className={styles.socialButtonBg}></div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#EA4335"/>
                      </svg>
                      <span>Google</span>
                    </button>
                    <button type="button" className={`${styles.socialButton} ${styles.facebookButton}`}>
                      <div className={styles.socialButtonBg}></div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M20.9,2H3.1C2.5,2,2,2.5,2,3.1v17.8C2,21.5,2.5,22,3.1,22h9.6v-7.8h-2.6v-3h2.6V9.2c0-2.6,1.6-4,3.9-4 c1.1,0,2.1,0.1,2.3,0.1v2.7h-1.6c-1.3,0-1.5,0.6-1.5,1.5v1.9h3l-0.4,3h-2.6V22h5.1c0.6,0,1.1-0.5,1.1-1.1V3.1C22,2.5,21.5,2,20.9,2z" fill="#1877F2"/>
                      </svg>
                      <span>Facebook</span>
                    </button>
                  </div>
                  
                  {/* Register link with animation */}
                  <div className={styles.registerContainer}>
                    <p className={styles.registerPrompt}>
                      Don&apos;t have an account?{' '}
                      <Link href="/register" className={styles.registerLink}>
                        Register Now
                        <span className={styles.registerArrow}>→</span>
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Decorative elements for the card */}
            <div className={styles.cardDecoration1}></div>
            <div className={styles.cardDecoration2}></div>
          </div>
          
          <div className={styles.termsText}>
            By logging in, you agree to our <span className={styles.termsLink}>Terms of Service</span> and <span className={styles.termsLink}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;