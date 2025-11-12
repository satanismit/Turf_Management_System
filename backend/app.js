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
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/turf_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/turfs', require('./routes/turfRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Serve API documentation
app.use('/docs', express.static('docs'));
app.get('/docs', (req, res) => {
    res.sendFile(__dirname + '/docs/index.html');
});

// Serve markdown documentation
app.get('/api-docs.md', (req, res) => {
    res.sendFile(__dirname + '/docs/API-Documentation.md');
});

// Root endpoint with API information
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Turf Management System API",
        version: "1.0.0",
        baseUrl: `http://localhost:${PORT}`,
        documentation: `http://localhost:${PORT}/docs`,
        endpoints: {
            auth: {
                signup: "POST /api/auth/signup",
                login: "POST /api/auth/login",
                profile: "GET /api/auth/profile",
                users: "GET /api/auth/users (Admin)"
            },
            turfs: {
                list: "GET /api/turfs",
                details: "GET /api/turfs/:id",
                create: "POST /api/turfs (Admin)",
                update: "PUT /api/turfs/:id (Admin)",
                delete: "DELETE /api/turfs/:id (Admin)"
            },
            bookings: {
                create: "POST /api/bookings/create",
                userBookings: "GET /api/bookings/user",
                allBookings: "GET /api/bookings/all (Admin)",
                cancel: "PUT /api/bookings/cancel/:id",
                updateStatus: "PUT /api/bookings/status/:id (Admin)"
            },
            payments: {
                process: "POST /api/payments/process",
                status: "GET /api/payments/status/:bookingId"
            },
            comments: {
                get: "GET /api/comments/:turfId",
                create: "POST /api/comments",
                update: "PUT /api/comments/:id",
                delete: "DELETE /api/comments/:id"
            },
            favorites: {
                add: "POST /api/auth/favorites/:turfId",
                remove: "DELETE /api/auth/favorites/:turfId",
                list: "GET /api/auth/favorites"
            }
        },
        docs: {
            html: `http://localhost:${PORT}/docs`,
            markdown: `http://localhost:${PORT}/api-docs.md`
        }
    });
});

// Error Handling
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
