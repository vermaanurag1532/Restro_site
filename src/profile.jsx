import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Avatar, Divider, Input, Button } from '@nextui-org/react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerById } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      
      try {
        const data = await fetchCustomerById(user['Customer Id']);
        setProfile(data);
      } catch (error) {
        setError('Failed to load profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user]);

  if (!user) return null;

  return (
    <Layout title="Profile">
      <div className="flex justify-center py-4">
        <Card className="w-full max-w-md">
          <CardHeader className="justify-center py-5">
            <Avatar
              src={profile?.Images && profile.Images.length > 0 
                ? profile.Images[0] 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.['Customer Name'] || 'User')}`
              }
              className="w-20 h-20"
            />
          </CardHeader>
          <Divider />
          <CardBody>
            {loading ? (
              <p className="text-center">Loading profile...</p>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <Input
                    disabled
                    value={profile?.['Customer Name'] || ''}
                    className="cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <Input
                    disabled
                    value={profile?.Email || ''}
                    className="cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Contact Number</label>
                  <Input
                    disabled
                    value={profile?.['Contact Number'] ? profile?.['Contact Number'].toString() : ''}
                    className="cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Customer ID</label>
                  <Input
                    disabled
                    value={profile?.['Customer Id'] || ''}
                    className="cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </CardBody>
          <Divider />
          <CardFooter className="justify-end">
            <Button color="primary" variant="ghost">
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;