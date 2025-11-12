const mongoose = require('mongoose');
const Turf = require('./models/Turf');
const User = require('./models/User');
require('dotenv').config();

// Additional turf data - Football and Badminton turfs
const additionalTurfs = [
    // Football Turfs
    {
        name: "Premier Football Arena",
        location: "Sports Central, Downtown",
        sportType: "Football",
        price: 2200,
        facilities: ["Artificial Turf", "Changing Rooms", "Floodlights", "Parking", "Water Stations", "First Aid"],
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
        description: "Professional football arena with FIFA standard artificial turf and premium facilities."
    },
    {
        name: "City Football Complex",
        location: "Green Valley, North District",
        sportType: "Football",
        price: 1800,
        facilities: ["Natural Grass", "Training Nets", "Floodlights", "Parking", "Cafeteria"],
        image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop",
        description: "Beautiful natural grass football complex perfect for training and matches."
    },
    {
        name: "Thunder Football Ground",
        location: "Industrial Zone, East Side",
        sportType: "Football",
        price: 1600,
        facilities: ["Artificial Turf", "Floodlights", "Changing Rooms", "Parking"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        description: "Modern football ground with excellent lighting for evening matches."
    },
    {
        name: "Victory Football Stadium",
        location: "Champions Area, South Zone",
        sportType: "Football",
        price: 2500,
        facilities: ["Premium Turf", "VIP Seating", "Electronic Scoreboard", "Floodlights", "Parking", "Cafeteria"],
        image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&h=600&fit=crop",
        description: "Elite football stadium with premium facilities and spectator areas."
    },

    // Badminton Turfs
    {
        name: "Ace Badminton Academy",
        location: "Sports Complex, Central City",
        sportType: "Badminton",
        price: 400,
        facilities: ["Wooden Courts", "Air Conditioning", "Equipment Rental", "Coaching Available", "Parking"],
        image: "https://images.unsplash.com/photo-1622279489826-043d873e9171?w=800&h=600&fit=crop",
        description: "Professional badminton academy with premium wooden courts and expert coaching."
    },
    {
        name: "Shuttle Masters Court",
        location: "Recreation Center, West District",
        sportType: "Badminton",
        price: 350,
        facilities: ["Synthetic Courts", "Lighting", "Changing Rooms", "Equipment Shop", "Parking"],
        image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop",
        description: "Modern badminton courts with excellent facilities for players of all levels."
    },
    {
        name: "Elite Badminton Center",
        location: "Premium Sports Zone, North Area",
        sportType: "Badminton",
        price: 500,
        facilities: ["Professional Courts", "Air Conditioning", "VIP Rooms", "Equipment Rental", "Cafeteria", "Parking"],
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        description: "Luxury badminton center with professional courts and premium amenities."
    },
    {
        name: "Champion Badminton Arena",
        location: "Tournament Grounds, East Zone",
        sportType: "Badminton",
        price: 450,
        facilities: ["Competition Courts", "Spectator Seating", "Lighting", "Changing Rooms", "Parking"],
        image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800&h=600&fit=crop",
        description: "Tournament-ready badminton arena with professional facilities and seating."
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/turf_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const createAdditionalTurfs = async () => {
    try {
        // Find admin user to set as owner
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('❌ No admin user found. Please create admin user first.');
            return;
        }

        console.log('📊 Creating additional Football and Badminton turfs...');

        for (const turfData of additionalTurfs) {
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
            console.log(`✅ Created turf: ${turf.name} (${turf.sportType}) - ₹${turf.price}/hour`);
        }

        console.log('🎉 All additional turfs created successfully!');
        console.log(`👤 Owner: ${adminUser.fullName} (${adminUser.email})`);
        console.log(`📈 Total turfs added: ${additionalTurfs.length}`);
        console.log(`⚽ Football turfs: ${additionalTurfs.filter(t => t.sportType === 'Football').length}`);
        console.log(`🏸 Badminton turfs: ${additionalTurfs.filter(t => t.sportType === 'Badminton').length}`);

    } catch (error) {
        console.error('❌ Error creating additional turfs:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdditionalTurfs();