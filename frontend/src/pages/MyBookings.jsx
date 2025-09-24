import { useState } from 'react';
import Card from '../components/Card';
import { bookings, turfs } from '../data/staticData';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Simulate user bookings with turf details
  const userBookings = bookings.map(booking => ({
    ...booking,
    turf: turfs.find(t => t.id === booking.turfId)
  }));

  const upcomingBookings = userBookings.filter(booking => booking.status === 'confirmed');
  const pastBookings = userBookings.filter(booking => booking.status === 'completed');
  const pendingBookings = userBookings.filter(booking => booking.status === 'pending');

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
          <h3 className="text-lg font-semibold">{booking.turf?.name}</h3>
          <p className="text-gray-600">📍 {booking.turf?.location}</p>
          <p className="text-gray-600">🏃 {booking.turf?.sportType}</p>
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
      
      <div className="flex gap-2">
        {booking.status === 'confirmed' && (
          <>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Cancel Booking
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Reschedule
            </button>
          </>
        )}
        {booking.status === 'completed' && (
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Rate & Review
          </button>
        )}
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          View Details
        </button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        
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
                Upcoming ({upcomingBookings.length})
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
            </nav>
          </div>
        </div>

        {/* Booking Lists */}
        <div>
          {activeTab === 'upcoming' && (
            <div>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No upcoming bookings</p>
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
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">No pending bookings</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div>
              {pastBookings.length > 0 ? (
                pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">No past bookings</p>
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
