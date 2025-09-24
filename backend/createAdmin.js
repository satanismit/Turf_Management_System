const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/turf_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@turfmanager.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@turfmanager.com');
            console.log('Username:', existingAdmin.username);
            return;
        }

        // Create admin user
        const adminUser = new User({
            fullName: 'Admin User',
            email: 'admin@turfmanager.com',
            username: 'admin',
            password: 'admin123',
            phone: '+91 9999999999',
            address: 'Admin Office',
            role: 'admin',
            gender: 'other'
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@turfmanager.com');
        console.log('👤 Username: admin');
        console.log('🔐 Password: admin123');
        console.log('');
        console.log('You can now login with these credentials!');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdminUser();