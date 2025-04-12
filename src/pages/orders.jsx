import { useState, useEffect } from 'react';
import { Card, CardBody, Divider, Button, Spinner, Badge, Accordion, AccordionItem } from '@nextui-org/react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/Order/customer/${user['Customer Id']}`);
        setOrders(response.data);
      } catch (error) {
        setError('Failed to load orders');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout title="Order History">
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Order History">
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
    <Layout title="Order History">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-lg text-gray-500 mb-4">You haven't placed any orders yet</p>
          <Button 
            color="primary" 
            onClick={() => router.push('/')}
          >
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Accordion key={order['Order Id']}>
              <AccordionItem 
                title={
                  <div className="flex justify-between items-center">
                    <span>Order #{order['Order Id'].split('-')[1]}</span>
                    <Badge color={order['Payment Status'] ? 'success' : 'warning'}>
                      {order['Payment Status'] ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(order.Date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span>{order.Time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Table:</span>
                        <span>{order['Table No']}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Serving Status:</span>
                        <Badge color={order['Serving Status'] ? 'success' : 'primary'}>
                          {order['Serving Status'] ? 'Served' : 'Preparing'}
                        </Badge>
                      </div>
                      
                      <Divider className="my-2" />
                      
                      <h3 className="font-semibold">Items</h3>
                      <div className="space-y-2">
                        {order.Dishes.map((dish, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{dish['DishId']} × {dish.Quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Divider className="my-2" />
                      
                      <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>₹{order.Amount}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Orders;