import { Card, CardHeader, CardBody, CardFooter, Divider, Button, Image } from '@nextui-org/react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { PlusIcon, MinusIcon } from '../components/Icons';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
  const router = useRouter();

  return (
    <Layout title="Cart">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-lg text-gray-500 mb-4">Your cart is empty</p>
          <Button 
            color="primary" 
            onClick={() => router.push('/')}
          >
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <Card key={item.dish['Dish Id']} className="w-full">
              <CardBody className="p-0">
                <div className="flex">
                  <div className="flex-shrink-0 w-1/4">
                    <Image
                      alt={item.dish.Name}
                      className="object-cover h-28 w-full"
                      src={`https://via.placeholder.com/150?text=${encodeURIComponent(item.dish.Name)}`}
                    />
                  </div>
                  <div className="p-3 flex-grow">
                    <h2 className="text-lg font-bold">{item.dish.Name}</h2>
                    <p className="text-primary font-bold mt-1">₹{item.dish.Price}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat"
                          onClick={() => updateQuantity(item.dish['Dish Id'], item.quantity - 1)}
                        >
                          <MinusIcon />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat"
                          onClick={() => updateQuantity(item.dish['Dish Id'], item.quantity + 1)}
                        >
                          <PlusIcon />
                        </Button>
                      </div>
                      <Button 
                        color="danger" 
                        variant="light"
                        size="sm"
                        onClick={() => removeFromCart(item.dish['Dish Id'])}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          <Card className="w-full mt-4">
            <CardBody>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Subtotal:</span>
                <span className="text-lg font-semibold">₹{getTotal()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Delivery Fee:</span>
                <span className="text-lg font-semibold">₹40</span>
              </div>
              <Divider className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">₹{getTotal() + 40}</span>
              </div>
            </CardBody>
            <CardFooter>
              <Button color="primary" className="w-full">
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Cart;