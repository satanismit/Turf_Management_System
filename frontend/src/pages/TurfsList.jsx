import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { turfs } from '../data/staticData';

const TurfsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');

  const filteredTurfs = turfs.filter(turf => {
    const matchesSearch = turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turf.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === '' || turf.sportType === selectedSport;
    return matchesSearch && matchesSport;
  });

  const sportTypes = [...new Set(turfs.map(turf => turf.sportType))];

  return (
    <div className="page-container">
      <div className="main-content">
        <h1 className="page-title">Available Turfs</h1>
        
        {/* Search and Filter */}
        <div className="space-bottom-large flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search turfs by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="form-select"
            >
              <option value="">All Sports</option>
              {sportTypes.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Turfs Grid */}
        <div className="grid-cards">
          {filteredTurfs.map(turf => (
            <Card key={turf.id} className="turf-card">
              <img
                src={turf.image}
                alt={turf.name}
                className="turf-image"
              />
              <h3 className="section-title">{turf.name}</h3>
              <p className="text-muted space-bottom"> {turf.location}</p>
              <p className="text-muted space-bottom"> {turf.sportType}</p>
              <p className="price-text">₹{turf.price}/hour</p>
              
              <div className="flex gap-2">
                <Link
                  to={`/turf/${turf.id}`}
                  className="flex-1 btn-primary text-center"
                >
                  View Details
                </Link>
                <Link
                  to={`/turf/${turf.id}/book`}
                  className="flex-1 btn-secondary text-center"
                >
                  Book Now
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredTurfs.length === 0 && (
          <div className="empty-state">
            <p className="empty-text">No turfs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfsList;
