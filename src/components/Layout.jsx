import Head from 'next/head';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { Spinner } from '@nextui-org/react';

const Layout = ({ children, title = 'Restaurant App' }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // List of paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // If user is not logged in and the current path is not public
  if (!user && !publicPaths.includes(router.pathname) && router.pathname !== '/') {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Restaurant mobile app" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-4">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;