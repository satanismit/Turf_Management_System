const mongoose = require('mongoose');
const Turf = require('./models/Turf');
const User = require('./models/User');
require('dotenv').config();

// Static turf data (same as frontend)
const staticTurfs = [
    {
        name: "Green Valley Sports Complex",
        location: "Downtown, City Center",
        sportType: "Football",
        price: 1500,
        facilities: ["Floodlights", "Changing Rooms", "Parking", "Cafeteria"],
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
        description: "Premium football turf with modern facilities and excellent maintenance."
    },
    {
        name: "Elite Cricket Ground",
        location: "Suburb Area, North Zone",
        sportType: "Cricket",
        price: 2000,
        facilities: ["Pavilion", "Practice Nets", "Scoreboard", "Parking"],
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
        description: "Professional cricket ground with international standard facilities."
    },
    {
        name: "Champions Basketball Court",
        location: "Sports District, East Side",
        sportType: "Basketball",
        price: 800,
        facilities: ["Indoor Court", "Air Conditioning", "Sound System", "Lockers"],
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        description: "Indoor basketball court perfect for tournaments and practice sessions."
    },
    {
        name: "Tennis Academy Courts",
        location: "Residential Area, West Zone",
        sportType: "Tennis",
        price: 1200,
        facilities: ["Multiple Courts", "Coaching Available", "Equipment Rental", "Parking"],
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
        description: "Professional tennis courts with coaching facilities available."
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/turf_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const createTurfsFromStaticData = async () => {
    try {
        // Find admin user to set as owner
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('❌ No admin user found. Please create admin user first.');
            return;
        }

        console.log('📊 Creating turfs from static data...');

        for (const turfData of staticTurfs) {
            // Check if turf already exists
            const existingTurf = await Turf.findOne({ name: turfData.name });
            if (existingTurf) {
                console.log(`⚠️  Turf "${turfData.name}" already exists, skipping...`);
                continue;
            }

            // Create new turf
            const turf = new Turf({
                ...turfData,
                ownerId: adminUser._id
            });

            await turf.save();
            console.log(`✅ Created turf: ${turf.name}`);
        }

        console.log('🎉 All turfs created successfully!');
        console.log(`👤 Owner: ${adminUser.fullName} (${adminUser.email})`);

    } catch (error) {
        console.error('❌ Error creating turfs:', error);
    } finally {
        mongoose.connection.close();
    }
};

createTurfsFromStaticData();