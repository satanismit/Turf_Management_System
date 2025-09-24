import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to view your bookings');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_API}/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(response.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage('Failed to load bookings');
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_API}/bookings/cancel/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Booking cancelled successfully!');
      fetchUserBookings(); // Refresh the bookings list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setMessage('Failed to cancel booking');
    }
  };

  // Filter bookings based on status
  const upcomingBookings = bookings.filter(booking => booking.status === 'confirmed');
  const pastBookings = bookings.filter(booking => booking.status === 'completed');
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const BookingCard = ({ booking }) => (
    <Card className="mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{booking.turfName}</h3>
          <p className="text-gray-600">� {booking.customerEmail}</p>
          <p className="text-gray-600">📱 {booking.customerPhone}</p>
          {booking.specialRequests && (
            <p className="text-gray-600">📝 {booking.specialRequests}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium">{booking.date}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Time</p>
          <p className="font-medium">{booking.timeSlot}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium text-green-600">₹{booking.totalAmount}</p>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        <p>Booking ID: {booking._id}</p>
        <p>Created: {new Date(booking.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div className="flex gap-2">
        {booking.status === 'confirmed' && (
          <>
            <button 
              onClick={() => cancelBooking(booking._id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Booking
            </button>
          </>
        )}
        {booking.status === 'pending' && (
          <button 
            onClick={() => cancelBooking(booking._id)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel Request
          </button>
        )}
        {booking.status === 'completed' && (
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Rate & Review
          </button>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        
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
                onClick={() => setActiveTab('upcoming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Confirmed ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({pendingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'past'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past Bookings ({pastBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled ({cancelledBookings.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Booking Lists */}
        <div>
          {activeTab === 'upcoming' && (
            <div>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No confirmed bookings</p>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Book a Turf
                  </button>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              {pendingBookings.length > 0 ? (
                pendingBookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">No pending booking requests</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div>
              {pastBookings.length > 0 ? (
                pastBookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">No past bookings</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'cancelled' && (
            <div>
              {cancelledBookings.length > 0 ? (
                cancelledBookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">No cancelled bookings</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
