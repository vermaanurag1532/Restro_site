import { Button } from '@nextui-org/react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const NotFound = () => {
  const router = useRouter();
  
  return (
    <Layout title="Page Not Found">
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-lg text-gray-500 mb-6">Page not found</p>
        <Button 
          color="primary" 
          onClick={() => router.push('/')}
        >
          Go Home
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;