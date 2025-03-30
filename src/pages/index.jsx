import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter, Image, Button, Spinner, Badge } from '@nextui-org/react';
import Layout from '../components/Layout';
import { fetchDishes } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, cart } = useCart();
  
  useEffect(() => {
    const getDishes = async () => {
      try {
        const data = await fetchDishes();
        setDishes(data);
      } catch (error) {
        setError('Failed to load dishes');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getDishes();
  }, []);

  const isInCart = (dishId) => {
    return cart.some(item => item.dish['Dish Id'] === dishId);
  };

  if (loading) {
    return (
      <Layout title="Home">
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size="lg" />
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

  return (
    <Layout title="Home">
      <h1 className="text-2xl font-bold mb-6">Menu</h1>
      <div className="grid grid-cols-1 gap-4">
        {dishes.map((dish) => (
          <Card 
            key={dish['Dish Id']} 
            className="w-full"
            isPressable
          >
            <CardBody className="p-0">
              <div className="flex">
                <div className="flex-shrink-0 w-1/3">
                  <Image
                    alt={dish.Name}
                    className="object-cover h-40 w-full"
                    src={dish.Images && dish.Images.length > 0 
                      ? `https://via.placeholder.com/150?text=${encodeURIComponent(dish.Name)}`
                      : `https://via.placeholder.com/150?text=${encodeURIComponent(dish.Name)}`
                    }
                  />
                </div>
                <div className="p-3 flex-grow">
                  <h2 className="text-lg font-bold">{dish.Name}</h2>
                  <p className="text-sm text-gray-700 line-clamp-2">{dish.Discription}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-primary font-bold">₹{dish.Price}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{dish.Rating}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge color="secondary" variant="flat" className="mr-1">
                      {dish['Cooking Time']}
                    </Badge>
                    {dish['Type of Dish'] && dish['Type of Dish'].map((type, i) => (
                      <Badge key={i} color="primary" variant="flat" className="mr-1">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="gap-3">
              <Button 
                color={isInCart(dish['Dish Id']) ? "success" : "primary"} 
                className="w-full"
                onClick={() => addToCart(dish)}
              >
                {isInCart(dish['Dish Id']) ? "Added to Cart" : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Home;