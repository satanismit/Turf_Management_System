// app.js serves as the main entry point for the Express.js server. 
// It initializes the application, sets up middleware for handling requests 
// (like parsing JSON or enabling CORS), connects to the database, 
// defines API routes (e.g., for login, registration, and turf bookings), 
// and starts the server to listen for incoming requests. 
// This file orchestrates the entire backend, ensuring all components work 
// together to provide the 12-15 APIs you mentioned. It's essential for 
// running the server and managing the application's flow.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/turf_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Error Handling
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
