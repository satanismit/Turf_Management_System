import { Link } from 'react-router-dom';
import Card from '../components/Card';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to TurfManager
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Book premium sports turfs with ease
          </p>
          <Link
            to="/turfs"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Explore Turfs
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TurfManager?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="text-green-600 text-4xl mb-4">🏟️</div>
              <h3 className="text-xl font-semibold mb-2">Premium Facilities</h3>
              <p className="text-gray-600">
                Access to top-quality sports turfs with modern amenities and equipment.
              </p>
            </Card>
            
            <Card className="text-center">
              <div className="text-green-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and quick booking process with instant confirmation.
              </p>
            </Card>
            
            <Card className="text-center">
              <div className="text-green-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing with transparent costs and no hidden fees.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of sports enthusiasts who trust TurfManager
          </p>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/turfs"
              className="bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Browse Turfs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
