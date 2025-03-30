import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Navbar as NextUINavbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { ShoppingCartIcon, UserIcon, HomeIcon, ClockIcon } from './Icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <NextUINavbar isBordered className="bg-white">
      <NavbarBrand>
        <p className="font-bold text-inherit">RESTAURANT</p>
      </NavbarBrand>
      <NavbarContent justify="end">
        {user ? (
          <>
            <NavbarItem>
              <Link 
                href="/" 
                color={router.pathname === '/' ? 'primary' : 'foreground'}
              >
                <HomeIcon />
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link 
                href="/profile" 
                color={router.pathname === '/profile' ? 'primary' : 'foreground'}
              >
                <UserIcon />
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link 
                href="/orders" 
                color={router.pathname === '/orders' ? 'primary' : 'foreground'}
              >
                <ClockIcon />
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link 
                href="/cart" 
                color={router.pathname === '/cart' ? 'primary' : 'foreground'}
              >
                <ShoppingCartIcon />
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button color="danger" variant="light" onClick={logout}>
                Logout
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link href="/login" color="foreground">
                Login
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" href="/register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
};

export default Navbar;