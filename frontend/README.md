# Turf Management System - Frontend

A modern React frontend for managing sports turf bookings with a clean, responsive design.

## Features

- **Home Page**: Welcome page with hero section and features overview
- **Authentication**: Login and Signup pages with form validation
- **Turf Management**: Browse turfs, view details, and make bookings
- **User Dashboard**: Profile management and booking history
- **Admin Panel**: Comprehensive dashboard for managing turfs, bookings, and users
- **Responsive Design**: Mobile-first design using TailwindCSS

## Tech Stack

- **React 19** with functional components and hooks
- **React Router 6** for navigation
- **TailwindCSS** for styling
- **Vite** for development and building

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Card.jsx        # Card wrapper component
│   ├── Form.jsx        # Form components (Form, FormInput, FormButton)
│   └── Navbar.jsx      # Navigation component
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login page
│   ├── Signup.jsx      # Registration page
│   ├── Profile.jsx     # User profile page
│   ├── TurfsList.jsx   # Turfs listing page
│   ├── TurfDetails.jsx # Individual turf details and booking
│   ├── MyBookings.jsx  # User's booking history
│   └── AdminDashboard.jsx # Admin management panel
├── data/
│   └── staticData.js   # Mock data for development
└── App.jsx            # Main app component with routing
```

## Available Routes

- `/` - Home page
- `/login` - User login
- `/signup` - User registration
- `/profile` - User profile management
- `/turfs` - Browse available turfs
- `/turf/:id` - Turf details and booking
- `/my-bookings` - User's booking history
- `/admin` - Admin dashboard

## Features Overview

### User Features
- Browse and search turfs by name, location, or sport type
- View detailed turf information including facilities and pricing
- Make bookings with date and time slot selection
- Manage user profile and view booking history
- Responsive design for mobile and desktop

### Admin Features
- Dashboard with overview statistics
- Manage turfs (view, add, edit, delete)
- Manage bookings (approve, cancel, view details)
- Manage users (view, edit, suspend)
- Comprehensive data tables with search and filtering

## Development Notes

- All data is currently static (hardcoded) for demonstration purposes
- Forms include basic validation and user feedback
- Components are designed to be reusable and maintainable
- TailwindCSS provides consistent styling and responsive design
- Clean component structure with separation of concerns

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
