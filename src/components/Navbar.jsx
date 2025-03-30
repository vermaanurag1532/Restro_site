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
  Badge
} from "@nextui-org/react";
import { motion } from 'framer-motion';
import { ShoppingCartIcon, UserIcon, HomeIcon, ClockIcon } from './Icons';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const navbarClass = `w-full z-50 mb-6 transition-all duration-300 ${
    scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white'
  }`;

  // Custom NavLink component with hover effects
  const NavLink = ({ href, icon, isActive }) => {
    return (
      <Link 
        href={href}
        className="relative px-3 py-2"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            isActive 
              ? 'bg-primary-100 text-primary-500' 
              : 'text-gray-500 hover:text-primary-500 hover:bg-gray-100'
          }`}
        >
          {icon}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -bottom-1 w-6 h-1 bg-primary-500 rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.div>
      </Link>
    );
  };

  // Brand logo animation
  const brandVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };

  if (!mounted) return null;

  return (
    <NextUINavbar className={navbarClass}>
      <NavbarBrand>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={brandVariants}
          className="flex items-center"
        >
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-2 mr-2">
            <span className="font-bold text-xl">F</span>
          </div>
          <p className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
            RedLinear
          </p>
        </motion.div>
      </NavbarBrand>
      
      <NavbarContent justify="end">
        {user ? (
          <>
            <NavbarItem>
              <NavLink 
                href="/" 
                icon={<HomeIcon />} 
                isActive={router.pathname === '/'} 
              />
            </NavbarItem>
            
            <NavbarItem>
              <NavLink 
                href="/profile" 
                icon={<UserIcon />} 
                isActive={router.pathname === '/profile'} 
              />
            </NavbarItem>
            
            <NavbarItem>
              <NavLink 
                href="/orders" 
                icon={<ClockIcon />} 
                isActive={router.pathname === '/orders'} 
              />
            </NavbarItem>
            
            <NavbarItem>
              <Badge 
                content={cart.length > 0 ? cart.length : null} 
                color="primary" 
                shape="circle" 
                size="sm"
                showOutline={false}
                className={cart.length === 0 ? "hidden" : ""}
              >
                <NavLink 
                  href="/cart" 
                  icon={<ShoppingCartIcon />} 
                  isActive={router.pathname === '/cart'} 
                />
              </Badge>
            </NavbarItem>
            
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
                >
                  Logout
                </Button>
              </motion.div>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  Login
                </Link>
              </motion.div>
            </NavbarItem>
            <NavbarItem>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  as={Link} 
                  href="/register" 
                  color="primary" 
                  variant="shadow"
                  radius="full"
                  className="font-medium px-4"
                >
                  Sign Up
                </Button>
              </motion.div>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
};

export default Navbar;