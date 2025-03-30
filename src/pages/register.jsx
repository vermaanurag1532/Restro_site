import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, CardHeader, CardBody, Input, Button, Divider } from '@nextui-org/react';
import Layout from '../components/Layout';
import { register } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    'Customer Name': '',
    'Contact Number': '',
    'Email': '',
    'Password': '',
    'Images': []
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Contact Number' ? parseInt(value || '0', 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.Password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await register(formData);
      router.push('/login');
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Register">
      <div className="flex justify-center items-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Register</h1>
            <p className="text-sm text-gray-500">Create your account</p>
          </CardHeader>
          <Divider />
          <CardBody>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                name="Customer Name"
                label="Name"
                placeholder="Enter your name"
                value={formData['Customer Name']}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="Contact Number"
                type="number"
                label="Contact Number"
                placeholder="Enter your contact number"
                value={formData['Contact Number'] || ''}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="Email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.Email}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="Password"
                type="password"
                label="Password"
                placeholder="Create a password"
                value={formData.Password}
                onChange={handleChange}
                isRequired
              />
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isRequired
              />
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="mt-2"
              >
                Register
              </Button>
              <p className="text-center text-sm mt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-primary">
                  Login
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;