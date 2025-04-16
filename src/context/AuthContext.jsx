import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

// API URL constant
const API_URL = 'http://localhost:3000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = Cookies.get('customer');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    Cookies.set('customer', JSON.stringify(userData), { expires: 7 });
  };

  // Enhanced logout function with direct table clearing
  const logout = async () => {
    try {
      if (user) {
        const customerId = user['Customer Id'];
        
        if (customerId) {
          console.log('Logging out customer:', customerId);
          
          try {
            // First, fetch all tables associated with this customer
            const tablesResponse = await axios.get(`${API_URL}/Table/customer/${customerId}`);
            const tables = tablesResponse.data;
            
            console.log('Tables to clear:', tables);
            
            // Clear each table one by one using direct API calls
            if (tables && tables.length > 0) {
              const clearPromises = tables.map(table => {
                const tableNo = table['Table No'];
                console.log(`Clearing customer from table ${tableNo}`);
                
                // Use axios directly to ensure proper request format
                return axios.put(`${API_URL}/Table/${tableNo}`, {
                  "Customer ID": null,
                  "Order Id": null
                }, {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }).catch(err => {
                  console.error(`Error clearing table ${tableNo}:`, err);
                  // Return a resolved promise to continue with other tables
                  return Promise.resolve();
                });
              });
              
              // Wait for all table clearing operations to complete
              await Promise.all(clearPromises);
            }
          } catch (error) {
            console.error('Error clearing tables during logout:', error);
            // Continue with logout even if table clearing fails
          }
        }
      }
    } catch (error) {
      console.error('Logout process error:', error);
    } finally {
      // Always clear the cookies and redirect
      setUser(null);
      Cookies.remove('customer');
      Cookies.remove('currentOrderId');
      Cookies.remove('orderStatus');
      Cookies.remove('cart');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);