import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import { BACKEND_API } from '../config';

const TurfsList = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/turfs`);
        setTurfs(response.data.turfs);
      } catch (error) {
        console.error('Error fetching turfs:', error);
        setError('Failed to load turfs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  const filteredTurfs = turfs.filter(turf => {
    const matchesSearch = turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === '' || turf.sportType === selectedSport;
    return matchesSearch && matchesSport;
  });

  const sportTypes = [...new Set(turfs.map(turf => turf.sportType))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading turfs...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Turfs</h1>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search turfs by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Sports</option>
              {sportTypes.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Turfs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurfs.map(turf => (
            <Card key={turf._id} className="hover:shadow-lg transition-shadow">
              <img
                src={turf.image}
                alt={turf.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{turf.name}</h3>
              <p className="text-gray-600 mb-2"> {turf.location}</p>
              <p className="text-gray-600 mb-2"> {turf.sportType}</p>
              <p className="text-2xl font-bold text-green-600 mb-4">₹{turf.price}/hour</p>

              <div className="flex gap-2">
                <Link
                  to={`/turf/${turf._id}`}
                  className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  to={`/turf/${turf._id}`}
                  className="flex-1 bg-white text-green-600 border-2 border-green-600 text-center py-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredTurfs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No turfs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfsList;
