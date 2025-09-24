import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';
import { Form, FormInput, FormButton } from '../components/Form';
import { turfs } from '../data/staticData';

const TurfDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const turf = turfs.find(t => t.id === parseInt(id));
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingData, setBookingData] = useState({
    date: '',
    timeSlot: '',
    specialRequests: ''
  });

  if (!turf) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Turf Not Found</h2>
          <Link to="/turfs" className="text-green-600 hover:text-green-700">
            Back to Turfs List
          </Link>
        </div>
      </div>
    );
  }

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM'
  ];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to make a booking');
        setLoading(false);
        return;
      }

      const bookingPayload = {
        turfId: turf.id,
        turfName: turf.name,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        totalAmount: turf.price,
        specialRequests: bookingData.specialRequests
      };

      const response = await axios.post(`${BACKEND_API}/bookings/create`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Booking request submitted successfully! You will be notified once confirmed.');
      setShowBookingForm(false);
      setBookingData({ date: '', timeSlot: '', specialRequests: '' });
      
      // Optional: Redirect to bookings page after a delay
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);

    } catch (error) {
      console.error('Booking error:', error);
      setMessage(error.response?.data?.error || 'Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/turfs" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Turfs
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Turf Information */}
          <div>
            <img
              src={turf.image}
              alt={turf.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            
            <Card>
              <h1 className="text-3xl font-bold mb-4">{turf.name}</h1>
              <div className="space-y-3 mb-6">
                <p className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">📍 Location:</span>
                  {turf.location}
                </p>
                <p className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">🏃 Sport:</span>
                  {turf.sportType}
                </p>
                <p className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">💰 Price:</span>
                  ₹{turf.price}/hour
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{turf.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {turf.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Section */}
          <div>
            <Card>
              <h2 className="text-2xl font-bold mb-4">Book This Turf</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                  {message}
                </div>
              )}
              
              {!showBookingForm ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Ready to book {turf.name}? Click below to proceed with your booking.
                  </p>
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              ) : (
                <Form onSubmit={handleBookingSubmit}>
                  <FormInput
                    label="Booking Date"
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot
                    </label>
                    <select
                      name="timeSlot"
                      value={bookingData.timeSlot}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">₹{turf.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Price per hour</p>
                  </div>

                  <div className="flex gap-4">
                    <FormButton type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Booking Request'}
                    </FormButton>
                    <FormButton
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowBookingForm(false);
                        setMessage('');
                      }}
                    >
                      Cancel
                    </FormButton>
                  </div>
                </Form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDetails;
