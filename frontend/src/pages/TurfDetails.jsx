import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';
import { Form, FormInput, FormButton } from '../components/Form';

const TurfDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingData, setBookingData] = useState({
    bookingType: 'slot',
    date: '',
    timeSlot: '',
    startTime: '',
    endTime: '',
    specialRequests: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isTodaySelected, setIsTodaySelected] = useState(false);
  const [minTime, setMinTime] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentMessage, setCommentMessage] = useState('');
  const [newComment, setNewComment] = useState({
    comment: '',
    rating: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    upiId: ''
  });

  // Calculate price based on booking type and duration
  const calculatePrice = (type, timeSlot, startTime, endTime) => {
    if (type === 'slot') {
      // Assuming 2 hours per slot
      return turf.price * 2;
    } else if (type === 'custom' && startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      const durationHours = Math.max(0, (endMinutes - startMinutes) / 60);
      return Math.ceil(turf.price * durationHours);
    }
    return 0;
  };

  const checkIfFavorite = async () => {
    if (!turf) return; // Prevent calling when turf is null
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BACKEND_API}/auth/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const favoriteIds = response.data.favorites.map(fav => fav._id);
      setIsFavorite(favoriteIds.includes(turf._id));
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  // Debug: Log URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking');
    console.log('TurfDetails mounted with:', { id, bookingId, search: window.location.search });
  }, []);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/turfs/${id}`);
        setTurf(response.data.turf);
        // Check if this turf is in user's favorites after loading
        if (response.data.turf) {
          checkIfFavorite();
        }
      } catch (error) {
        console.error('Error fetching turf:', error);
        setError('Failed to load turf details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [id]);

  // Check for booking parameter to show payment form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking');

    console.log('TurfDetails: Checking for booking parameter', { bookingId, turfLoaded: !!turf });

    if (bookingId) {
      // Fetch the specific booking details for payment
      const fetchBookingForPayment = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found');
            return;
          }

          console.log('Fetching booking for payment:', bookingId);

          const response = await axios.get(`${BACKEND_API}/bookings/user`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const booking = response.data.bookings.find(b => b._id === bookingId);
          console.log('Found booking:', booking);

          if (booking && booking.status === 'created') {
            setCurrentBooking(booking);
            setShowPaymentForm(true);
            console.log('Payment form should now be visible');
          } else {
            console.error('Booking not found or not in created status', { booking, status: booking?.status });
          }
        } catch (error) {
          console.error('Error fetching booking for payment:', error);
        }
      };

      fetchBookingForPayment();
    }
  }, []); // Run only on mount

  // Fetch comments when turf is loaded
  useEffect(() => {
    if (turf) {
      const fetchComments = async () => {
        try {
          const response = await axios.get(`${BACKEND_API}/comments/${turf._id}`);
          setComments(response.data);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };
      fetchComments();
    }
  }, [turf]);

  // Update price when booking data changes
  useEffect(() => {
    if (!turf) return;
    const price = calculatePrice(
      bookingData.bookingType,
      bookingData.timeSlot,
      bookingData.startTime,
      bookingData.endTime
    );
    setCalculatedPrice(price);
  }, [bookingData, turf]);

  // Update date/time constraints when date changes
  useEffect(() => {
    if (bookingData.date) {
      const selectedDate = new Date(bookingData.date);
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();
      
      setIsTodaySelected(isToday);
      
      if (isToday) {
        // Set minimum time to current time + 30 minutes buffer
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Add 30 minutes buffer
        const minTimeStr = now.toTimeString().slice(0, 5); // HH:MM format
        setMinTime(minTimeStr);
      } else {
        setMinTime('');
      }
    }
  }, [bookingData.date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading turf details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

  // Function to get available time slots based on selected date
  const getAvailableTimeSlots = () => {
    const selectedDate = new Date(bookingData.date);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (!isToday) {
      // Return all slots for future dates
      return timeSlots;
    }

    // For today, filter out past slots
    const now = new Date();
    const currentHour = now.getHours();

    return timeSlots.filter(slot => {
      // Extract start hour from slot string (e.g., "6:00 AM - 8:00 AM" -> 6)
      const startTimeStr = slot.split(' - ')[0];
      const [time, period] = startTimeStr.split(' ');
      let [hour] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      // Include slots that start at least 30 minutes from now
      return hour > currentHour || (hour === currentHour && now.getMinutes() < 30);
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setBookingLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to make a booking');
        setBookingLoading(false);
        return;
      }

      // Validate date and time constraints
      const selectedDate = new Date(bookingData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison

      if (selectedDate < today) {
        setMessage('Cannot book for past dates');
        setBookingLoading(false);
        return;
      }

      const isToday = selectedDate.toDateString() === new Date().toDateString();

      if (isToday) {
        if (bookingData.bookingType === 'slot') {
          // Check if selected slot is still available
          const availableSlots = getAvailableTimeSlots();
          if (!availableSlots.includes(bookingData.timeSlot)) {
            setMessage('Selected time slot is no longer available for today');
            setBookingLoading(false);
            return;
          }
        } else if (bookingData.bookingType === 'custom') {
          // Check if start time is in the future
          const now = new Date();
          const [startHour, startMin] = bookingData.startTime.split(':').map(Number);
          const startDateTime = new Date();
          startDateTime.setHours(startHour, startMin, 0, 0);

          if (startDateTime <= now) {
            setMessage('Start time must be at least 30 minutes in the future');
            setBookingLoading(false);
            return;
          }
        }
      }

      const bookingPayload = {
        turfId: turf._id,
        date: bookingData.date,
        bookingType: bookingData.bookingType,
        specialRequests: bookingData.specialRequests
      };

      if (bookingData.bookingType === 'slot') {
        bookingPayload.timeSlot = bookingData.timeSlot;
      } else {
        bookingPayload.startTime = bookingData.startTime;
        bookingPayload.endTime = bookingData.endTime;
      }

      const response = await axios.post(`${BACKEND_API}/bookings/create`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentBooking(response.data.booking);
      setMessage('Booking details saved! Please complete payment from My Bookings.');
      setShowBookingForm(false);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);

    } catch (error) {
      console.error('Booking error:', error);
      setMessage(error.response?.data?.error || 'Failed to submit booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentMessage('');
    setCommentLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCommentMessage('Please login to add a comment');
        setCommentLoading(false);
        return;
      }

      const commentPayload = {
        turfId: turf._id,
        comment: newComment.comment,
        rating: newComment.rating ? parseInt(newComment.rating) : null
      };

      const response = await axios.post(`${BACKEND_API}/comments`, commentPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(prev => [response.data, ...prev]);
      setNewComment({ comment: '', rating: '' });
      setCommentMessage('Comment added successfully!');

    } catch (error) {
      console.error('Comment error:', error);
      setCommentMessage(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({ ...prev, [name]: value }));
  };

  const handleFavoriteToggle = async () => {
    if (!turf) return;
    
    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to add favorites');
        setFavoriteLoading(false);
        return;
      }

      if (isFavorite) {
        await axios.delete(`${BACKEND_API}/auth/favorites/${turf._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        setMessage('Removed from favorites');
      } else {
        await axios.post(`${BACKEND_API}/auth/favorites/${turf._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
        setMessage('Added to favorites');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Favorite error:', error);
      setMessage(error.response?.data?.error || 'Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setPaymentLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to complete payment');
        setPaymentLoading(false);
        return;
      }

      const paymentPayload = {
        bookingId: currentBooking._id,
        paymentMethod: paymentData.paymentMethod,
        cardDetails: paymentData.paymentMethod === 'upi' 
          ? { upiId: paymentData.upiId }
          : {
              cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
              expiryDate: paymentData.expiryDate,
              cvv: paymentData.cvv,
              cardHolderName: paymentData.cardHolderName
            }
      };

      const response = await axios.post(`${BACKEND_API}/payments/process`, paymentPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Payment successful! Receipt sent to your email.');
      
      // Reset forms and redirect
      setTimeout(() => {
        setShowPaymentForm(false);
        setCurrentBooking(null);
        setPaymentData({
          paymentMethod: 'credit_card',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolderName: '',
          upiId: ''
        });
        navigate('/my-bookings');
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
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
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{turf.name}</h1>
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favoriteLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <span className="text-xl">{isFavorite ? '♥' : '♡'}</span>
                  )}
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <p className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2"> Location:</span>
                  {turf.location}
                </p>
                <p className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2"> Sport:</span>
                  {turf.sportType}
                </p>
                <p className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2"> Price:</span>
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Type
                    </label>
                    <select
                      name="bookingType"
                      value={bookingData.bookingType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="slot">Predefined Time Slots</option>
                      <option value="custom">Custom Time Range</option>
                    </select>
                  </div>

                  <FormInput
                    label="Booking Date"
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />

                  {bookingData.bookingType === 'slot' ? (
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
                        {getAvailableTimeSlots().map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Each slot is 2 hours long
                        {isTodaySelected && getAvailableTimeSlots().length < timeSlots.length && 
                          " (Past slots are not available for today's bookings)"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={bookingData.startTime}
                          onChange={handleInputChange}
                          min={isTodaySelected ? minTime : undefined}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {isTodaySelected && (
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum time: {minTime} (30 min buffer)
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={bookingData.endTime}
                          onChange={handleInputChange}
                          min={bookingData.startTime || (isTodaySelected ? minTime : undefined)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

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
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Price per Hour:</span>
                      <span className="text-lg font-bold text-green-600">₹{turf.price}</span>
                    </div>
                    {bookingData.bookingType === 'slot' ? (
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Duration:</span>
                        <span className="text-gray-600">2 hours</span>
                      </div>
                    ) : (
                      bookingData.startTime && bookingData.endTime && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Duration:</span>
                          <span className="text-gray-600">
                            {(() => {
                              const [startHour, startMin] = bookingData.startTime.split(':').map(Number);
                              const [endHour, endMin] = bookingData.endTime.split(':').map(Number);
                              const startMinutes = startHour * 60 + startMin;
                              const endMinutes = endHour * 60 + endMin;
                              const durationHours = Math.max(0, (endMinutes - startMinutes) / 60);
                              return `${durationHours.toFixed(1)} hours`;
                            })()}
                          </span>
                        </div>
                      )
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">₹{calculatedPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <FormButton type="submit" disabled={bookingLoading}>
                      {bookingLoading ? 'Creating Booking...' : 'Create Booking'}
                    </FormButton>
                    <FormButton
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowBookingForm(false);
                        setMessage('');
                        setBookingData({
                          bookingType: 'slot',
                          date: '',
                          timeSlot: '',
                          startTime: '',
                          endTime: '',
                          specialRequests: ''
                        });
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

        {/* Payment Section */}
        {showPaymentForm && currentBooking && (
          <div className="mt-8">
            <Card>
              <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                  {message}
                </div>
              )}

              {/* Booking Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Turf:</span> {currentBooking.turfName}</p>
                  <p><span className="font-medium">Sport:</span> {currentBooking.sportType || 'Cricket'}</p>
                  <p><span className="font-medium">Location:</span> {currentBooking.location || 'N/A'}</p>
                  <p><span className="font-medium">Date:</span> {currentBooking.date}</p>
                  <p><span className="font-medium">Time:</span> {currentBooking.bookingType === 'slot' ? currentBooking.timeSlot : `${currentBooking.startTime} - ${currentBooking.endTime}`}</p>
                  <p><span className="font-medium">Total Amount:</span> ₹{currentBooking.totalAmount}</p>
                </div>
              </div>

              <Form onSubmit={handlePaymentSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentData.paymentMethod === 'credit_card'}
                        onChange={handlePaymentChange}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300">
                        <div className="text-center">
                          <div className="text-2xl mb-2">⊕</div>
                          <div className="font-medium">Credit Card</div>
                        </div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="debit_card"
                        checked={paymentData.paymentMethod === 'debit_card'}
                        onChange={handlePaymentChange}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300">
                        <div className="text-center">
                          <div className="text-2xl mb-2">⊕</div>
                          <div className="font-medium">Debit Card</div>
                        </div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentData.paymentMethod === 'upi'}
                        onChange={handlePaymentChange}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300">
                        <div className="text-center">
                          <div className="text-2xl mb-2">◎</div>
                          <div className="font-medium">UPI</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {(paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') && (
                  <div className="space-y-4">
                    <FormInput
                      label="Card Holder Name"
                      type="text"
                      name="cardHolderName"
                      value={paymentData.cardHolderName}
                      onChange={handlePaymentChange}
                      placeholder="Om  Choksi"
                      required
                    />
                    <FormInput
                      label="Card Number"
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        label="Expiry Date"
                        type="text"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                      <FormInput
                        label="CVV"
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentData.paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <FormInput
                      label="UPI ID"
                      type="text"
                      name="upiId"
                      value={paymentData.upiId}
                      onChange={handlePaymentChange}
                      placeholder="user@upi"
                      required
                    />
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Scan QR Code or enter UPI ID to pay</p>
                      <div className="text-center">
                        <img
                          src="/assets/QRcode.jpg"
                          alt="UPI QR Code"
                          className="inline-block max-w-full h-auto border-2 border-gray-300 rounded-lg"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Payment:</span>
                    <span className="text-xl font-bold text-green-600">₹{currentBooking.totalAmount}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <FormButton type="submit" disabled={paymentLoading}>
                    {paymentLoading ? 'Processing Payment...' : `Pay ₹${currentBooking.totalAmount}`}
                  </FormButton>
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setShowBookingForm(true);
                      setMessage('');
                      setCurrentBooking(null);
                    }}
                  >
                    Back to Booking
                  </FormButton>
                </div>
              </Form>
            </Card>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8">
          <Card>
            <h2 className="text-2xl font-bold mb-6">Comments & Reviews</h2>

            {commentMessage && (
              <div className={`mb-4 p-3 rounded ${commentMessage.includes('success') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                {commentMessage}
              </div>
            )}

            {/* Add Comment Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add Your Comment</h3>
              <Form onSubmit={handleCommentSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (Optional)
                  </label>
                  <select
                    name="rating"
                    value={newComment.rating}
                    onChange={handleCommentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select rating</option>
                    <option value="5">✦✦✦✦✦ (5 stars)</option>
                    <option value="4">✦✦✦✦ (4 stars)</option>
                    <option value="3">✦✦✦ (3 stars)</option>
                    <option value="2">✦✦ (2 stars)</option>
                    <option value="1">✦ (1 star)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    name="comment"
                    value={newComment.comment}
                    onChange={handleCommentChange}
                    rows="4"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Share your experience with this turf..."
                  />
                </div>

                <FormButton type="submit" disabled={commentLoading}>
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </FormButton>
              </Form>
            </div>

            {/* Display Comments */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No comments yet. Be the first to share your experience!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">
                          {comment.userId?.fullName || comment.userId?.username || 'Anonymous'}
                        </span>
                        {comment.rating && (
                          <span className="text-yellow-500">
                            {'✦'.repeat(comment.rating)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default TurfDetails;
