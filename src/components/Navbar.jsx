import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { 
  Navbar as NextUINavbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Link, 
  Button,
  Badge,
  NavbarMenuToggle
} from "@nextui-org/react";
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, UserIcon, HomeIcon, ClockIcon } from './Icons';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navbarClass = `w-full z-50 transition-all duration-300 ${
    scrolled ? 'bg-white shadow-md' : 'bg-white'
  } ${router.pathname === '/' ? 'mb-0' : 'mb-4'}`;

  // Cart badge animation
  const badgePulse = cart.length > 0 ? {
    scale: [1, 1.2, 1],
    transition: { 
      repeat: 2, 
      repeatType: "reverse", 
      duration: 0.3,
      repeatDelay: 0.5
    }
  } : {};

  // Custom NavLink component with hover effects
  const NavLink = ({ href, icon, isActive, label }) => {
    return (
      <Link 
        href={href}
        className="relative px-2 py-2"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            isActive 
              ? 'bg-orange-50 text-orange-500' 
              : 'text-gray-600 hover:text-orange-500 hover:bg-gray-50'
          }`}
        >
          {icon}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -bottom-1 w-5 h-1 bg-orange-500 rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.div>
        {label && <span className="sr-only">{label}</span>}
      </Link>
    );
  };

  // Menu item variants for animation
  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { 
      opacity: 0, 
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Sliding menu animations
  const slideMenuVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      x: "-100%", 
      opacity: 0,
      transition: {
        type: "tween",
        ease: "easeInOut",
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  // Overlay animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!mounted) return null;

  return (
    <>
      <NextUINavbar className={navbarClass} maxWidth="xl" isBordered={scrolled}>
        {/* Mobile menu toggle button */}
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-orange-500"
          />
        </NavbarContent>

        <NavbarBrand>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-2 mr-2 shadow-sm">
              <span className="font-bold text-xl">R</span>
            </div>
            <p className="font-bold text-lg text-gray-800">RedLinear</p>
          </motion.div>
        </NavbarBrand>
        
        {/* Desktop Navigation */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {user && (
            <>
              <NavbarItem>
                <NavLink 
                  href="/" 
                  icon={<HomeIcon />} 
                  isActive={router.pathname === '/'} 
                  label="Home"
                />
              </NavbarItem>
              
              <NavbarItem>
                <NavLink 
                  href="/orders" 
                  icon={<ClockIcon />} 
                  isActive={router.pathname === '/orders'} 
                  label="Orders"
                />
              </NavbarItem>
              
              <NavbarItem>
                <motion.div animate={badgePulse}>
                  <Badge 
                    content={cart.length > 0 ? cart.length : null} 
                    color="danger" 
                    shape="circle" 
                    size="sm"
                    showOutline={false}
                    className={`${cart.length === 0 ? "hidden" : ""}`}
                  >
                    <NavLink 
                      href="/cart" 
                      icon={<ShoppingCartIcon />} 
                      isActive={router.pathname === '/cart'} 
                      label="Cart"
                    />
                  </Badge>
                </motion.div>
              </NavbarItem>
              
              <NavbarItem>
                <NavLink 
                  href="/profile" 
                  icon={<UserIcon />} 
                  isActive={router.pathname === '/profile'} 
                  label="Profile"
                />
              </NavbarItem>
            </>
          )}
        </NavbarContent>

        {/* Desktop Logout Button */}
        <NavbarContent className="hidden sm:flex" justify="end">
          {user ? (
            <NavbarItem>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  color="danger" 
                  variant="light" 
                  onClick={logout}
                  size="sm"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  }
                >
                  Logout
                </Button>
              </motion.div>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button 
                as={Link} 
                href="/login"
                color="primary" 
                variant="flat"
                size="sm"
              >
                Login
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>

          <NavbarContent className="sm:hidden flex items-center justify-end gap-0" justify="end">
            {user && (
              <>
                <NavbarItem className="px-0">
                  <NavLink 
                    href="/" 
                    icon={<HomeIcon />} 
                    isActive={router.pathname === '/'} 
                    label="Home"
                  />
                </NavbarItem>
                
                
                <NavbarItem className="px-0">
                  <motion.div animate={badgePulse}>
                    <Badge 
                      content={cart.length > 0 ? cart.length : null} 
                      color="danger" 
                      shape="circle" 
                      size="sm"
                      showOutline={false}
                      className={cart.length === 0 ? "hidden" : ""}
                    >
                      <NavLink 
                        href="/cart" 
                        icon={<ShoppingCartIcon />} 
                        isActive={router.pathname === '/cart'} 
                        label="Cart"
                      />
                    </Badge>
                  </motion.div>
                </NavbarItem>
                
                <NavbarItem className="px-0">
                  <NavLink 
                    href="/profile" 
                    icon={<UserIcon />} 
                    isActive={router.pathname === '/profile'} 
                    label="Profile"
                  />
                </NavbarItem>
                
                <NavbarItem className="flex">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      isIconOnly
                      color="danger" 
                      variant="light" 
                      onClick={logout}
                      size="sm"
                      className="min-w-0 w-10 h-10 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </Button>
                  </motion.div>
                </NavbarItem>
              </>
            )}
            
            {!user && (
              <NavbarItem>
                <Button 
                  as={Link} 
                  href="/login"
                  color="warning" 
                  variant="flat"
                  size="sm"
                  radius="full"
                  className="font-medium bg-orange-50 text-orange-500"
                >
                  Login
                </Button>
              </NavbarItem>
            )}
          </NavbarContent>
      </NextUINavbar>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              className="fixed inset-0 bg-black/50 z-50 sm:hidden backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Sliding Menu */}
            <motion.div
              className="fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white z-50 sm:hidden overflow-y-auto"
              variants={slideMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="py-6 px-4 bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-2 mr-3 shadow-md">
                      <span className="font-bold text-xl">R</span>
                    </div>
                    <p className="font-bold text-xl text-gray-800">RedLinear</p>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    color="default"
                    variant="light"
                    onClick={() => setIsMenuOpen(false)}
                    className="mr-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </div>
              </div>
              
              {user ? (
                <div className="py-4">
                  <nav className="space-y-2 px-2">
                    <motion.div variants={menuItemVariants} custom={1}>
                      <Link 
                        href="/"
                        className={`flex items-center px-4 py-3 rounded-xl w-full transition-colors ${
                          router.pathname === '/' 
                            ? 'bg-orange-50 text-orange-500 font-medium' 
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HomeIcon className="mr-3 flex-shrink-0" />
                        <span>Home</span>
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={menuItemVariants} custom={3}>
                      <Link 
                        href="/cart" 
                        className={`flex items-center px-4 py-3 rounded-xl w-full transition-colors ${
                          router.pathname === '/cart' 
                            ? 'bg-orange-50 text-orange-500 font-medium' 
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingCartIcon className="mr-3 flex-shrink-0" />
                        <span>Cart</span>
                        {cart.length > 0 && (
                          <motion.span 
                            className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {cart.length}
                          </motion.span>
                        )}
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={menuItemVariants} custom={4}>
                      <Link 
                        href="/profile" 
                        className={`flex items-center px-4 py-3 rounded-xl w-full transition-colors ${
                          router.pathname === '/profile' 
                            ? 'bg-orange-50 text-orange-500 font-medium' 
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserIcon className="mr-3 flex-shrink-0" />
                        <span>Profile</span>
                      </Link>
                    </motion.div>
                  </nav>
                  
                  <motion.div 
                    className="px-4 mt-4 pt-4 border-t border-gray-100"
                    variants={menuItemVariants} 
                    custom={5}
                  >
                    <Button 
                      color="danger" 
                      variant="flat" 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full rounded-xl"
                      startContent={(
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                      )}
                    >
                      Logout
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="py-6 px-4">
                  <Button 
                    as={Link} 
                    href="/login" 
                    color="warning"
                    variant="flat"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full justify-center rounded-xl text-orange-500"
                    size="lg"
                  >
                    Login
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;