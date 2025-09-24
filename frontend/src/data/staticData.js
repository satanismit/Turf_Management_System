// Static data for the Turf Management System

export const turfs = [
  {
    id: 1,
    name: "Green Valley Sports Complex",
    location: "Downtown, City Center",
    sportType: "Football",
    price: 1500,
    facilities: ["Floodlights", "Changing Rooms", "Parking", "Cafeteria"],
    image: "https://5.imimg.com/data5/SELLER/Default/2023/10/350327019/NU/WB/TZ/38215148/7-a-side-football-turf.jpg",
    description: "Premium football turf with modern facilities and excellent maintenance."
  },
  {
    id: 2,
    name: "Elite Cricket Ground",
    location: "Suburb Area, North Zone",
    sportType: "Cricket",
    price: 2000,
    facilities: ["Pavilion", "Practice Nets", "Scoreboard", "Parking"],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFyzQPzYs8G21pMIdg77aK06kp-AZTQYJ6NA&s",
    description: "Professional cricket ground with international standard facilities."
  },
  {
    id: 3,
    name: "Champions Basketball Court",
    location: "Sports District, East Side",
    sportType: "Basketball",
    price: 800,
    facilities: ["Indoor Court", "Air Conditioning", "Sound System", "Lockers"],
    image: "https://img.freepik.com/premium-photo/outdoor-sports-field-with-artificial-turf-playing-tennis-basketball_182615-1225.jpg",
    description: "Indoor basketball court perfect for tournaments and practice sessions."
  },
  {
    id: 4,
    name: "Tennis Academy Courts",
    location: "Residential Area, West Zone",
    sportType: "Tennis",
    price: 1200,
    facilities: ["Multiple Courts", "Coaching Available", "Equipment Rental", "Parking"],
    image: "https://5.imimg.com/data5/SELLER/Default/2023/4/303074400/HG/EF/HR/16569354/synthetic-artificial-grass-turf-tennis-court.jpg",
    description: "Professional tennis courts with coaching facilities available."
  }
];

export const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    role: "user"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 9876543211",
    role: "user"
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@turfmanager.com",
    phone: "+91 9876543212",
    role: "admin"
  }
];

export const bookings = [
  {
    id: 1,
    userId: 1,
    turfId: 1,
    date: "2024-01-15",
    timeSlot: "10:00 AM - 12:00 PM",
    status: "confirmed",
    totalAmount: 1500
  },
  {
    id: 2,
    userId: 2,
    turfId: 2,
    date: "2024-01-16",
    timeSlot: "2:00 PM - 4:00 PM",
    status: "pending",
    totalAmount: 2000
  },
  {
    id: 3,
    userId: 1,
    turfId: 3,
    date: "2024-01-17",
    timeSlot: "6:00 PM - 8:00 PM",
    status: "confirmed",
    totalAmount: 800
  }
];
