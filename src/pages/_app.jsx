import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <NextUIProvider>
          <Component {...pageProps} />
        </NextUIProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default MyApp;