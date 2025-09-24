import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setMessage('Please login to access this page');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      setMessage('Access denied. Admin privileges required.');
      setLoading(false);
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    setAdminUser(user);
    fetchAdminData();
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch bookings and users
      const [bookingsResponse, usersResponse] = await Promise.all([
        axios.get(`${BACKEND_API}/bookings/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_API}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBookings(bookingsResponse.data.bookings || []);
      setUsers(usersResponse.data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setMessage(error.response?.data?.error || 'Failed to load admin data');
      // Ensure arrays are set even on error
      setBookings([]);
      setUsers([]);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_API}/bookings/status/${bookingId}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(`Booking ${status} successfully!`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking:', error);
      setMessage('Failed to update booking status');
    }
  };

  // Dashboard stats - with safe fallbacks for undefined arrays
  const stats = {
    totalUsers: users?.length || 0,
    totalBookings: bookings?.length || 0,
    pendingBookings: bookings?.filter(b => b.status === 'pending')?.length || 0,
    totalRevenue: bookings?.filter(b => b.status === 'confirmed' || b.status === 'completed')
                           ?.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) || 0
  };

  const OverviewTab = () => (
    <div>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
          <div className="text-gray-600">Total Users</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalBookings}</div>
          <div className="text-gray-600">Total Bookings</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingBookings}</div>
          <div className="text-gray-600">Pending Requests</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-gray-600">Total Revenue</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {(bookings || []).slice(0, 5).map(booking => (
              <div key={booking._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{booking.turfName}</p>
                  <p className="text-sm text-gray-600">{booking.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{booking.totalAmount}</p>
                  <p className={`text-xs px-2 py-1 rounded ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <p className="text-gray-500 text-center py-4">No bookings yet</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {(users || []).slice(0, 5).map(user => (
              <div key={user._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <p className="text-gray-500 text-center py-4">No users yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const BookingsTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Manage Bookings</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turf & Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(bookings || []).map(booking => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.turfName}</div>
                    <div className="text-sm text-gray-500">{booking.customerName}</div>
                    <div className="text-xs text-gray-400">{booking.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.date}</div>
                  <div className="text-sm text-gray-500">{booking.timeSlot}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">₹{booking.totalAmount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!bookings || bookings.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>
    </Card>
  );

  const UsersTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Users Management</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(users || []).map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!users || users.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (message && (!bookings?.length && !users?.length)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {adminUser && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {adminUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{adminUser.fullName}</p>
                  <p className="text-sm text-gray-600">{adminUser.email}</p>
                  <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                    {adminUser.role.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {message && (
          <div className={`mb-6 p-3 rounded ${message.includes('success') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            {message}
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings ({bookings?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'users' && <UsersTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;