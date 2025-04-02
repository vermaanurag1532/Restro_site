import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardBody, 
  Input,
  Button,
  Spinner,
  Avatar
} from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { fetchDishes } from '../services/api';
import { useCart } from '../context/CartContext';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typingDirection, setTypingDirection] = useState('forward');
  const [typingPosition, setTypingPosition] = useState(0);
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const timerRef = useRef(null);
  
  const searchPlaceholders = [
    "Search for pizza...",
    "Search for burger...",
    "Search for pasta...",
    "Search for biryani...",
    "Search for paneer dishes..."
  ];

  // Animate placeholder text
  useEffect(() => {
    const animatePlaceholder = () => {
      const currentText = searchPlaceholders[placeholderIndex];
      
      if (typingDirection === 'forward') {
        if (typingPosition < currentText.length) {
          setCurrentPlaceholder(currentText.substring(0, typingPosition + 1));
          setTypingPosition(prev => prev + 1);
        } else {
          // Hold at the end for a moment
          timerRef.current = setTimeout(() => {
            setTypingDirection('backward');
          }, 1500);
          return;
        }
      } else {
        if (typingPosition > 0) {
          setCurrentPlaceholder(currentText.substring(0, typingPosition - 1));
          setTypingPosition(prev => prev - 1);
        } else {
          // Move to next placeholder
          setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
          setTypingDirection('forward');
          return;
        }
      }
      
      // Set the typing speed
      const delay = typingDirection === 'forward' ? 100 : 50;
      timerRef.current = setTimeout(animatePlaceholder, delay);
    };
    
    timerRef.current = setTimeout(animatePlaceholder, 500);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [placeholderIndex, typingDirection, typingPosition]);

  useEffect(() => {
    const getDishes = async () => {
      try {
        const data = await fetchDishes();
        setDishes(data);
        setFilteredDishes(data);
        
        // Extract and group dishes by category
        const categoryMap = {};
        data.forEach(dish => {
          if (dish['Type of Dish'] && Array.isArray(dish['Type of Dish'])) {
            dish['Type of Dish'].forEach(type => {
              if (!categoryMap[type]) {
                categoryMap[type] = [];
              }
              categoryMap[type].push(dish);
            });
          }
        });
        
        // Set initial expanded state for categories
        const initialExpandedState = {};
        Object.keys(categoryMap).forEach(category => {
          initialExpandedState[category] = true; // Start with all expanded
        });
        setExpandedCategories(initialExpandedState);
        setCategories(Object.keys(categoryMap));
        
      } catch (error) {
        setError('Failed to load dishes');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getDishes();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const categoryMenu = document.getElementById('category-menu');
      const menuBtn = document.getElementById('menu-btn');
      
      if (showCategoryMenu && 
          categoryMenu && 
          !categoryMenu.contains(event.target) && 
          menuBtn && 
          !menuBtn.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryMenu]);

  useEffect(() => {
    if (dishes.length) {
      let result = [...dishes];
      
      // Filter by search query
      if (searchQuery) {
        result = result.filter(dish => 
          dish.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.Discription?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by category
      if (selectedCategory !== 'all') {
        result = result.filter(dish => 
          dish['Type of Dish'] && dish['Type of Dish'].some(type => 
            type.toLowerCase() === selectedCategory.toLowerCase()
          )
        );
      }
      
      setFilteredDishes(result);
    }
  }, [searchQuery, selectedCategory, dishes]);

  const isInCart = (dishId) => {
    return cart.some(item => item.dish['Dish Id'] === dishId);
  };

  // Group dishes by category
  const groupDishesByCategory = () => {
    const grouped = {};
    
    filteredDishes.forEach(dish => {
      if (dish['Type of Dish'] && Array.isArray(dish['Type of Dish'])) {
        dish['Type of Dish'].forEach(type => {
          if (!grouped[type]) {
            grouped[type] = [];
          }
          if (!grouped[type].some(d => d['Dish Id'] === dish['Dish Id'])) {
            grouped[type].push(dish);
          }
        });
      }
    });
    
    return grouped;
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const scrollToCategory = (category) => {
    document.getElementById(`category-${category}`)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setShowCategoryMenu(false);
  };

  const toggleCategoryMenu = () => {
    setShowCategoryMenu(!showCategoryMenu);
  };

  if (loading) {
    return (
      <Layout title="Home">
        <div className="fixed inset-0 flex flex-col justify-center items-center">
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img src="/test.jpg" alt="Logo" className="w-20 h-20 rounded-full object-cover" />
            </motion.div>
          </div>
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 font-medium">Loading delicious dishes...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Home">
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <p className="text-red-500">{error}</p>
          <Button color="primary" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  const groupedDishes = groupDishesByCategory();

  return (
    <Layout title="Home">
      <Head>
        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
          
          /* Custom navbar styling */
          .custom-navbar {
            background: linear-gradient(to right, #ffffff, #f8f9fa);
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          /* Menu button styling */
          .menu-btn {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 100;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .menu-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          }
          
          /* Category menu styling */
          .category-menu {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 99;
            background-color: #333;
            color: white;
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-height: 70vh;
            overflow-y: auto;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
          }
          
          .category-menu.show {
            transform: translateY(0);
          }
          
          /* Overlay styling */
          .menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 98;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(2px);
          }
          
          .menu-overlay.show {
            opacity: 1;
            pointer-events: auto;
          }
          
          /* Category item styling */
          .category-item {
            display: flex;
            justify-content: space-between;
            padding: 15px 20px;
            border-bottom: 1px solid #444;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .category-item:hover {
            background-color: #444;
            padding-left: 25px;
          }
          
          /* Food card styling */
          .food-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .food-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          /* Add button styling */
          .add-btn {
            background-color: white;
            color: #60b246;
            font-weight: 600;
            font-size: 0.8rem;
            padding: 0.4rem 1rem;
            border: 1px solid #d4d5d9;
            border-radius: 4px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .add-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          /* Search bar styling */
          .search-container {
            position: relative;
            margin-bottom: 0.75rem;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.95));
          }
          
          .search-bar {
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          
          .search-bar:focus-within {
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
          
          .search-bar input {
            line-height: 1.5;
          }
          
          /* Search tag hover effect */
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.2); }
            70% { box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
            100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
          }
          
          .search-tag:hover {
            animation: pulse 1.5s infinite;
          }
          
          /* Category styling */
          .category-header {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            margin-bottom: 0.5rem;
            padding: 0.75rem 1rem;
            transition: all 0.2s ease;
          }
          
          .category-header:hover {
            background-color: #f8f9fa;
          }
        `}</style>
      </Head>
      
      {/* Custom Navbar */}
      <div className="custom-navbar py-3 px-4 flex items-center justify-between mb-2">
        <div className="flex items-center">
          <img src="/test.jpg" alt="Restaurant Logo" className="w-10 h-10 rounded-full object-cover mr-3" />
          <div>
            <h1 className="text-lg font-bold">RedLinear Restro</h1>
            <p className="text-xs text-gray-500">Delicious food Menu</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 pt-2 pb-20">
        {/* Enhanced Search Bar with Animated Placeholder */}
        <div className="search-container sticky top-16 z-10 pt-3 pb-5">
          <div className="relative">
            <Input
              type="search"
              placeholder={currentPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              clearable
              size="lg"
              className="search-bar"
              classNames={{
                inputWrapper: "border-2 border-gray-200 hover:border-primary-300 focus-within:border-primary-500 py-2 px-4 shadow-md bg-white/90 backdrop-blur-sm outline-none",
                input: "text-md font-medium outline-none",
                clearButton: "text-gray-500 hover:text-primary-500"
              }}
              startContent={
                <motion.div
                  animate={{ 
                    rotate: searchQuery ? [0, 15, -15, 0] : 0,
                    scale: searchQuery ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-gray-500 mr-2"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </motion.div>
              }
            />
            
            {/* Popular Search Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {searchPlaceholders.map((placeholder) => (
                <motion.div
                  key={placeholder}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => setSearchQuery(placeholder.replace("Search for ", "").replace("...", ""))}
                >
                  <span className="text-xs bg-gray-100 hover:bg-primary-50 px-3 py-1 rounded-full text-gray-600 hover:text-primary-600 transition-colors duration-200 border border-gray-200 hover:border-primary-200 inline-flex items-center">
                    <span className="mr-1">#</span>
                    {placeholder.replace("Search for ", "").replace("...", "")}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Categories and Dishes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {Object.keys(groupedDishes).length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="60" 
                height="60" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mx-auto text-gray-300 mb-4"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <path d="M17 8.5H3.5a2.5 2.5 0 0 0 0 5H17"></path>
                <path d="M19 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"></path>
                <path d="M22 12v1a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V5"></path>
              </motion.svg>
              <p className="text-gray-500">No dishes found matching your search.</p>
            </motion.div>
          ) : (
            Object.entries(groupedDishes).map(([category, dishes], index) => (
              <motion.div 
                key={category} 
                id={`category-${category}`} 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Category Header */}
                <motion.div 
                  className="category-header flex justify-between items-center cursor-pointer"
                  onClick={() => toggleCategory(category)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <h2 className="text-lg font-semibold">{category}</h2>
                    <span className="ml-2 text-sm text-gray-500">({dishes.length})</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedCategories[category] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </motion.div>
                </motion.div>
                
                {/* Dishes List */}
                <AnimatePresence>
                  {expandedCategories[category] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      {dishes.map((dish, dishIndex) => (
                        <motion.div
                          key={dish['Dish Id']}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: dishIndex * 0.05 }}
                          className="food-card bg-white rounded-lg overflow-hidden shadow-sm my-3 border border-gray-100"
                        >
                          <div className="p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-grow pr-4">
                                <h3 className="text-base font-medium">{dish.Name}</h3>
                                <div className="flex items-center mt-1">
                                  {dish.Rating && (
                                    <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-xs">
                                      <span className="text-white bg-green-500 px-1 py-0.5 rounded text-xs font-bold">★ {dish.Rating}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dish.Discription}</p>
                                <p className="text-base font-semibold mt-2">₹{dish.Price}</p>
                              </div>
                              <div className="relative min-w-[100px] w-[100px] h-[100px]">
                                <img 
                                  src={dish.Images && dish.Images.length > 0 
                                    ? `https://via.placeholder.com/100?text=${encodeURIComponent(dish.Name)}`
                                    : "/test.jpg"
                                  } 
                                  alt={dish.Name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <motion.div 
                                  className="absolute bottom-0 right-0"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <button 
                                    className="add-btn bg-green-500 text-white px-2 py-1 rounded-md font-medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(dish);
                                    }}
                                  >
                                    {isInCart(dish['Dish Id']) ? 'ADDED' : 'ADD'}
                                  </button>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
      
      {/* Menu Button */}
      <motion.div 
        id="menu-btn" 
        className="menu-btn"
        onClick={toggleCategoryMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
      
      {/* Overlay */}
      <motion.div 
        className={`menu-overlay ${showCategoryMenu ? 'show' : ''}`}
        onClick={() => setShowCategoryMenu(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: showCategoryMenu ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      ></motion.div>
      
      {/* Category Menu */}
      <div id="category-menu" className={`category-menu ${showCategoryMenu ? 'show' : ''}`}>
        <div className="py-5 px-3">
          <div className="border-b border-gray-700 pb-3 mb-2 px-2">
            <h3 className="text-lg font-medium text-white">Categories</h3>
          </div>
          {categories.map((category, index) => (
            <motion.div
              key={category}
              className="category-item"
              onClick={() => scrollToCategory(category)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: showCategoryMenu ? 1 : 0, x: showCategoryMenu ? 0 : -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <span>{category}</span>
              <span>{groupedDishes[category]?.length || 0}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;