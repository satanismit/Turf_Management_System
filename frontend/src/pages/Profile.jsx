import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';
import { Form, FormInput, FormButton } from '../components/Form';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    role: 'user',
    createdAt: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to view profile');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data.user;
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        emergencyContact: user.emergencyContact || '',
        role: user.role || 'user',
        createdAt: user.createdAt || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to update profile');
        return;
      }

      await axios.put(`${BACKEND_API}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsEditing(false);
      setMessage('Profile updated successfully!');
      
      // Refresh profile data
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                  {message}
                </div>
              )}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  <FormInput
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                  <FormInput
                    label="Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                  />
                  <FormInput
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <FormInput
                    label="Emergency Contact"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleInputChange}
                  />
                  
                  <div className="flex gap-4">
                    <FormButton type="submit">
                      Save Changes
                    </FormButton>
                    <FormButton
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </FormButton>
                  </div>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{profileData.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-gray-900">{profileData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="mt-1 text-gray-900">{profileData.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-gray-900">{profileData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-gray-900">{profileData.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-gray-900">{profileData.dateOfBirth || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 text-gray-900 capitalize">{profileData.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="mt-1 text-gray-900">{profileData.emergencyContact || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Type</label>
                    <p className="mt-1 text-gray-900 capitalize">{profileData.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-gray-900">{new Date(profileData.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Account Stats */}
          <div>
            <Card>
              <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹15,600</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <div className="text-sm text-gray-600">Favorite Turfs</div>
                </div>
              </div>
            </Card>

            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Notification Settings
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Download Data
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
