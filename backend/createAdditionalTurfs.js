const mongoose = require('mongoose');
const Turf = require('./models/Turf');
const User = require('./models/User');
require('dotenv').config();

// Additional turf data - 8 more cricket turfs
const additionalTurfs = [
    {
        name: "Royal Cricket Academy",
        location: "Premium Sports Zone, South City",
        sportType: "Cricket",
        price: 2500,
        facilities: ["Floodlights", "Pavilion", "Practice Nets", "Electronic Scoreboard", "Parking", "Cafeteria"],
        image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&h=600&fit=crop",
        description: "Elite cricket academy with state-of-the-art facilities for professional training."
    },
    {
        name: "Victory Cricket Ground",
        location: "Champions District, East Zone",
        sportType: "Cricket",
        price: 1800,
        facilities: ["Practice Nets", "Changing Rooms", "Floodlights", "Parking", "Water Facilities"],
        image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800&h=600&fit=crop",
        description: "Well-maintained cricket ground perfect for league matches and tournaments."
    },
    {
        name: "Metro Cricket Stadium",
        location: "Central Business District",
        sportType: "Cricket",
        price: 3000,
        facilities: ["VIP Pavilion", "Electronic Scoreboard", "Floodlights", "Media Facilities", "Parking", "Cafeteria"],
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        description: "Premium cricket stadium with international standard facilities and VIP amenities."
    },
    {
        name: "Sunrise Cricket Ground",
        location: "Residential Complex, North Zone",
        sportType: "Cricket",
        price: 1600,
        facilities: ["Practice Nets", "Floodlights", "Changing Rooms", "Parking"],
        image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop",
        description: "Beautiful morning cricket ground with excellent lighting for evening matches."
    },
    {
        name: "Thunder Cricket Arena",
        location: "Sports Complex, West Zone",
        sportType: "Cricket",
        price: 2200,
        facilities: ["Multiple Pitches", "Practice Nets", "Electronic Scoreboard", "Floodlights", "Parking"],
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
        description: "Dynamic cricket arena designed for high-energy matches and training sessions."
    },
    {
        name: "Heritage Cricket Club",
        location: "Heritage District, Old City",
        sportType: "Cricket",
        price: 1900,
        facilities: ["Traditional Pavilion", "Practice Nets", "Floodlights", "Parking", "Club House"],
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
        description: "Historic cricket club with traditional charm and modern facilities."
    },
    {
        name: "Phoenix Cricket Ground",
        location: "Industrial Area, Tech Park",
        sportType: "Cricket",
        price: 1700,
        facilities: ["Modern Facilities", "Practice Nets", "Floodlights", "Parking", "Refreshment Area"],
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
        description: "Modern cricket ground with cutting-edge facilities for the next generation."
    },
    {
        name: "Eagle Cricket Stadium",
        location: "Airport Road, Transit Zone",
        sportType: "Cricket",
        price: 2800,
        facilities: ["Premium Pitch", "VIP Boxes", "Electronic Scoreboard", "Floodlights", "Parking", "Cafeteria"],
        image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&h=600&fit=crop",
        description: "Majestic cricket stadium with premium facilities and excellent accessibility."
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

        console.log('📊 Creating additional cricket turfs...');

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
            console.log(`✅ Created turf: ${turf.name} (${turf.sportType})`);
        }

        console.log('🎉 All additional turfs created successfully!');
        console.log(`👤 Owner: ${adminUser.fullName} (${adminUser.email})`);
        console.log(`📈 Total turfs added: ${additionalTurfs.length}`);

    } catch (error) {
        console.error('❌ Error creating additional turfs:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdditionalTurfs();