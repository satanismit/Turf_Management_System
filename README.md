# Turf Management System

Turf Management System is a simple full-stack web application designed to manage turf bookings and administration. It provides an easy-to-use interface for users to register, log in, and book turfs, while also offering admin features for managing bookings and users.

The frontend is built using React and Vite, ensuring a fast and responsive user experience. The backend is powered by Node.js and Express.js, handling all business logic and API requests securely and efficiently.

Key features include user authentication (login and registration), turf booking, and an admin dashboard. The system exposes 12-15 RESTful APIs for various operations such as authentication, booking, and user management.

To get started, make sure you have Node.js and npm installed. First, set up the backend by navigating to the `backend` folder, installing dependencies, and starting the server. Then, set up the frontend by navigating to the `frontend` folder, installing dependencies, and running the development server.

Sample API endpoints include:
- `POST /api/login` for user login
- `POST /api/register` for user registration
- `GET /api/turfs` to list all turfs
- `POST /api/book` to book a turf
and more for complete turf management functionality.

The project structure is straightforward:
```
Turf_Management_System/
	backend/    # Express.js API server
	frontend/   # React client (Vite)
```

This project is released under the MIT License.