import { useState } from 'react';
import Card from '../components/Card';
import { turfs, users, bookings } from '../data/staticData';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard stats
  const stats = {
    totalTurfs: turfs.length,
    totalUsers: users.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
  };

  const OverviewTab = () => (
    <div>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalTurfs}</div>
          <div className="text-gray-600">Total Turfs</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
          <div className="text-gray-600">Total Users</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalBookings}</div>
          <div className="text-gray-600">Total Bookings</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-gray-600">Total Revenue</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {bookings.slice(0, 5).map(booking => {
              const turf = turfs.find(t => t.id === booking.turfId);
              const user = users.find(u => u.id === booking.userId);
              return (
                <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{turf?.name}</p>
                    <p className="text-sm text-gray-600">{user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{booking.totalAmount}</p>
                    <p className="text-sm text-gray-600">{booking.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Popular Turfs</h3>
          <div className="space-y-3">
            {turfs.slice(0, 5).map(turf => (
              <div key={turf.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{turf.name}</p>
                  <p className="text-sm text-gray-600">{turf.sportType}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{turf.price}/hr</p>
                  <p className="text-sm text-gray-600">{turf.location}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const TurfsTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Manage Turfs</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Add New Turf
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Location</th>
              <th className="text-left py-2">Sport</th>
              <th className="text-left py-2">Price</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {turfs.map(turf => (
              <tr key={turf.id} className="border-b">
                <td className="py-3">{turf.name}</td>
                <td className="py-3">{turf.location}</td>
                <td className="py-3">{turf.sportType}</td>
                <td className="py-3">₹{turf.price}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const BookingsTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Manage Bookings</h3>
        <div className="flex gap-2">
          <select className="px-3 py-1 border border-gray-300 rounded">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Booking ID</th>
              <th className="text-left py-2">User</th>
              <th className="text-left py-2">Turf</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => {
              const turf = turfs.find(t => t.id === booking.turfId);
              const user = users.find(u => u.id === booking.userId);
              return (
                <tr key={booking.id} className="border-b">
                  <td className="py-3">#{booking.id}</td>
                  <td className="py-3">{user?.name}</td>
                  <td className="py-3">{turf?.name}</td>
                  <td className="py-3">{booking.date}</td>
                  <td className="py-3">₹{booking.totalAmount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                      <button className="text-green-600 hover:text-green-800">Approve</button>
                      <button className="text-red-600 hover:text-red-800">Cancel</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const UsersTab = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Manage Users</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="px-3 py-1 border border-gray-300 rounded"
          />
          <select className="px-3 py-1 border border-gray-300 rounded">
            <option>All Roles</option>
            <option>Admin</option>
            <option>User</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Phone</th>
              <th className="text-left py-2">Role</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td className="py-3">{user.name}</td>
                <td className="py-3">{user.email}</td>
                <td className="py-3">{user.phone}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'turfs', label: 'Turfs' },
                { id: 'bookings', label: 'Bookings' },
                { id: 'users', label: 'Users' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'turfs' && <TurfsTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'users' && <UsersTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
