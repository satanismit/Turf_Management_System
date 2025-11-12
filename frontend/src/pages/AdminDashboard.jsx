import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showTurfForm, setShowTurfForm] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);
  const [turfFormData, setTurfFormData] = useState({
    name: '',
    location: '',
    sportType: '',
    price: '',
    facilities: '',
    description: '',
    image: null
  });
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

      // Fetch bookings, users, and turfs
      const [bookingsResponse, usersResponse, turfsResponse] = await Promise.all([
        axios.get(`${BACKEND_API}/bookings/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_API}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_API}/turfs`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBookings(bookingsResponse.data.bookings || []);
      setUsers(usersResponse.data.users || []);
      setTurfs(turfsResponse.data.turfs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setMessage(error.response?.data?.error || 'Failed to load admin data');
      // Ensure arrays are set even on error
      setBookings([]);
      setUsers([]);
      setTurfs([]);
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

  const handleTurfFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      Object.keys(turfFormData).forEach(key => {
        if (turfFormData[key] !== null && turfFormData[key] !== '') {
          formData.append(key, turfFormData[key]);
        }
      });

      if (editingTurf) {
        await axios.put(`${BACKEND_API}/turfs/${editingTurf._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('Turf updated successfully!');
      } else {
        await axios.post(`${BACKEND_API}/turfs`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('Turf created successfully!');
      }

      setShowTurfForm(false);
      setEditingTurf(null);
      resetTurfForm();
      fetchAdminData();
    } catch (error) {
      console.error('Error saving turf:', error);
      setMessage(error.response?.data?.error || 'Failed to save turf');
    }
  };

  const handleEditTurf = (turf) => {
    setEditingTurf(turf);
    setTurfFormData({
      name: turf.name,
      location: turf.location,
      sportType: turf.sportType,
      price: turf.price,
      facilities: turf.facilities.join(', '),
      description: turf.description,
      image: null
    });
    setShowTurfForm(true);
  };

  const handleDeleteTurf = async (turfId) => {
    if (!window.confirm('Are you sure you want to delete this turf?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_API}/turfs/${turfId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Turf deleted successfully!');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting turf:', error);
      setMessage('Failed to delete turf');
    }
  };

  const resetTurfForm = () => {
    setTurfFormData({
      name: '',
      location: '',
      sportType: '',
      price: '',
      facilities: '',
      description: '',
      image: null
    });
  };

  // Handle turf form changes (text inputs, file input, facilities CSV)
  const handleTurfFormChange = (e) => {
    const { name, value, files, type } = e.target;

    setTurfFormData(prev => {
      // File input
      if (name === 'image') {
        return { ...prev, image: files && files[0] ? files[0] : null };
      }

      // Facilities input - keep it as comma separated string in form state
      if (name === 'facilities') {
        return { ...prev, facilities: value };
      }

      // Price should be stored as string but allow numeric characters only in input
      if (name === 'price') {
        // allow empty or numeric values
        const sanitized = value === '' ? '' : value.replace(/[^0-9.]/g, '');
        return { ...prev, price: sanitized };
      }

      // Default for text inputs
      return { ...prev, [name]: value };
    });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_API}/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('User deleted successfully!');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Failed to delete user');
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    const action = currentStatus === 'blocked' ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      
      await axios.put(`${BACKEND_API}/auth/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`User ${action}ed successfully!`);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage(`Failed to ${action} user`);
    }
  };

  const fetchComments = async (turfId = '') => {
    try {
      const token = localStorage.getItem('token');
      const url = turfId ? `${BACKEND_API}/comments/${turfId}/all` : `${BACKEND_API}/comments/${selectedTurf || turfs[0]?._id || '1'}/all`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const moderateComment = async (commentId, isVisible) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_API}/comments/${commentId}/moderate`,
        { isVisible },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Comment ${isVisible ? 'shown' : 'hidden'} successfully!`);
      fetchComments(selectedTurf);
    } catch (error) {
      console.error('Error moderating comment:', error);
      setMessage('Failed to moderate comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_API}/comments/${commentId}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Comment deleted successfully!');
      fetchComments(selectedTurf);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setMessage('Failed to delete comment');
    }
  };

  // Dashboard stats - with safe fallbacks for undefined arrays
  const stats = {
    totalUsers: users?.length || 0,
    totalBookings: bookings?.length || 0,
    totalTurfs: turfs?.length || 0,
    pendingBookings: bookings?.filter(b => b.status === 'paid')?.length || 0, // Only paid bookings need admin approval
    totalRevenue: bookings?.filter(b => b.status === 'paid' || b.status === 'confirmed' || b.status === 'completed')
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
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalTurfs}</div>
          <div className="text-gray-600">Total Turfs</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalBookings}</div>
          <div className="text-gray-600">Total Bookings</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingBookings}</div>
          <div className="text-gray-600">Pending Requests</div>
        </Card>
        <Card className="text-center md:col-span-4">
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
                  <p className="text-xs text-gray-500">
                    {booking.bookingType === 'slot' ? booking.timeSlot : `${booking.startTime} - ${booking.endTime}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{booking.totalAmount}</p>
                  <p className={`text-xs px-2 py-1 rounded ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'created' ? 'bg-orange-100 text-orange-800' :
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
                  <div className="text-sm text-gray-500">
                    {booking.bookingType === 'slot' ? (
                      booking.timeSlot
                    ) : (
                      `${booking.startTime} - ${booking.endTime} (${booking.duration}h)`
                    )}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{booking.bookingType} booking</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">₹{booking.totalAmount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'created' ? 'bg-orange-100 text-orange-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {booking.status === 'paid' && (
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
                    {booking.status === 'created' && (
                      <span className="text-orange-600 text-xs">Waiting for payment</span>
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBlockUser(user._id, user.status)}
                      className={`px-3 py-1 rounded text-xs ${user.status === 'blocked'
                        ? 'text-green-600 hover:text-green-900 bg-green-100'
                        : 'text-yellow-600 hover:text-yellow-900 bg-yellow-100'
                        }`}
                    >
                      {user.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
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

  const TurfsTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Turfs Management</h3>
        <button
          onClick={() => {
            setEditingTurf(null);
            resetTurfForm();
            setShowTurfForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Turf
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turf Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sport & Price
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
            {(turfs || []).map(turf => (
              <tr key={turf._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {turf.image && (
                      <img
                        src={turf.image}
                        alt={turf.name}
                        className="w-12 h-12 rounded mr-3 object-cover"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{turf.name}</div>
                      <div className="text-sm text-gray-500">{turf.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{turf.sportType}</div>
                  <div className="text-sm text-gray-500">₹{turf.price}/hour</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${turf.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {turf.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTurf(turf)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTurf(turf._id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!turfs || turfs.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No turfs found</p>
          </div>
        )}
      </div>

      {/* Turf Form Modal */}
      {showTurfForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingTurf ? 'Edit Turf' : 'Add New Turf'}
            </h3>

            {/* Sample Data Buttons */}
            {!editingTurf && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Quick Start with Sample Data:</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTurfFormData({
                      name: "Green Valley Sports Complex",
                      location: "Downtown, City Center",
                      sportType: "Football",
                      price: "1500",
                      facilities: "Floodlights, Changing Rooms, Parking, Cafeteria",
                      description: "Premium football turf with modern facilities and excellent maintenance.",
                      image: null
                    })}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Football Turf
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurfFormData({
                      name: "Elite Cricket Ground",
                      location: "Suburb Area, North Zone",
                      sportType: "Cricket",
                      price: "2000",
                      facilities: "Pavilion, Practice Nets, Scoreboard, Parking",
                      description: "Professional cricket ground with international standard facilities.",
                      image: null
                    })}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Cricket Ground
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurfFormData({
                      name: "Champions Basketball Court",
                      location: "Sports District, East Side",
                      sportType: "Basketball",
                      price: "800",
                      facilities: "Indoor Court, Air Conditioning, Sound System, Lockers",
                      description: "Indoor basketball court perfect for tournaments and practice sessions.",
                      image: null
                    })}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Basketball Court
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurfFormData({
                      name: "Tennis Academy Courts",
                      location: "Residential Area, West Zone",
                      sportType: "Tennis",
                      price: "1200",
                      facilities: "Multiple Courts, Coaching Available, Equipment Rental, Parking",
                      description: "Professional tennis courts with coaching facilities available.",
                      image: null
                    })}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Tennis Courts
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurfFormData({
                      name: "Ace Badminton Academy",
                      location: "Sports Complex, Central City",
                      sportType: "Badminton",
                      price: "400",
                      facilities: "Wooden Courts, Air Conditioning, Equipment Rental, Coaching Available, Parking",
                      description: "Professional badminton academy with premium wooden courts and expert coaching.",
                      image: null
                    })}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  >
                    Badminton Courts
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleTurfFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={turfFormData.name}
                  onChange={handleTurfFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={turfFormData.location}
                  onChange={handleTurfFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sport Type</label>
                <input
                  type="text"
                  name="sportType"
                  value={turfFormData.sportType}
                  onChange={handleTurfFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Hour</label>
                <input
                  type="number"
                  name="price"
                  value={turfFormData.price}
                  onChange={handleTurfFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Facilities (comma separated)</label>
                <input
                  type="text"
                  name="facilities"
                  value={turfFormData.facilities}
                  onChange={handleTurfFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Floodlights, Changing Rooms, Parking, Cafeteria"
                />
                <p className="text-xs text-gray-500 mt-1">Separate facilities with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={turfFormData.description}
                  onChange={handleTurfFormChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleTurfFormChange}
                  accept="image/*"
                  className="mt-1 block w-full"
                  {...(editingTurf ? {} : { required: true })}
                />
                {editingTurf && (
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editingTurf ? 'Update Turf' : 'Create Turf'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTurfForm(false);
                    setEditingTurf(null);
                    resetTurfForm();
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );

  const CommentsTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Comments Moderation</h3>
        <div className="flex gap-2">
          <select
            value={selectedTurf}
            onChange={(e) => {
              setSelectedTurf(e.target.value);
              fetchComments(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select Turf</option>
            {turfs.map(turf => (
              <option key={turf._id} value={turf._id}>{turf.name}</option>
            ))}
          </select>
          <button
            onClick={() => fetchComments(selectedTurf)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map(comment => (
              <tr key={comment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate" title={comment.comment}>
                    {comment.comment}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {comment.userId?.fullName || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {comment.userId?.username || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {comment.rating ? (
                    <span className="text-yellow-500">
                      {'✦'.repeat(comment.rating)}
                    </span>
                  ) : (
                    <span className="text-gray-400">No rating</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${comment.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {comment.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => moderateComment(comment._id, !comment.isVisible)}
                      className={`px-3 py-1 rounded text-xs ${comment.isVisible
                        ? 'text-yellow-600 hover:text-yellow-900 bg-yellow-100'
                        : 'text-green-600 hover:text-green-900 bg-green-100'
                        }`}
                    >
                      {comment.isVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!comments || comments.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedTurf ? 'No comments found for this turf' : 'Select a turf to view comments'}
            </p>
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
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'bookings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Bookings ({bookings?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Users ({users?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('turfs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'turfs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Turfs ({turfs?.length || 0})
              </button>
              <button
                onClick={() => {
                  setActiveTab('comments');
                  if (!selectedTurf && turfs.length > 0) {
                    setSelectedTurf(turfs[0]._id);
                    fetchComments(turfs[0]._id);
                  } else if (selectedTurf) {
                    fetchComments(selectedTurf);
                  }
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'comments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Comments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'turfs' && <TurfsTab />}
          {activeTab === 'comments' && <CommentsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;