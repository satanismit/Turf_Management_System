# Turf Management System API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

### POST /api/auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

### GET /api/auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "favorites": ["turf_id_1", "turf_id_2"]
  }
}
```

### PUT /api/auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phone": "+1987654321"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "fullName": "John Doe Updated",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1987654321"
  }
}
```

### POST /api/auth/favorites/:turfId
Add turf to user favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Added to favorites"
}
```

### DELETE /api/auth/favorites/:turfId
Remove turf from user favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Removed from favorites"
}
```

### GET /api/auth/favorites
Get user's favorite turfs.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "favorites": [
    {
      "id": "turf_id",
      "name": "Green Valley Turf",
      "location": "Downtown",
      "sportType": "Cricket",
      "price": 500,
      "image": "image_url"
    }
  ]
}
```

### GET /api/auth/users (Admin Only)
Get all users.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "fullName": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    }
  ]
}
```

### PUT /api/auth/users/:userId/status (Admin Only)
Update user status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "active|inactive|suspended"
}
```

**Response:**
```json
{
  "message": "User status updated successfully"
}
```

### DELETE /api/auth/users/:userId (Admin Only)
Delete user account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Turf Endpoints

### GET /api/turfs
Get all turfs with optional filtering.

**Query Parameters:**
- `sportType`: Filter by sport type (Cricket, Football, etc.)
- `location`: Filter by location
- `search`: Search in name and location

**Response:**
```json
{
  "turfs": [
    {
      "id": "turf_id",
      "name": "Green Valley Turf",
      "location": "Downtown",
      "sportType": "Cricket",
      "price": 500,
      "facilities": ["Parking", "Changing Room"],
      "description": "Well maintained cricket ground",
      "image": "image_url",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/turfs/:id
Get specific turf details.

**Response:**
```json
{
  "turf": {
    "id": "turf_id",
    "name": "Green Valley Turf",
    "location": "Downtown",
    "sportType": "Cricket",
    "price": 500,
    "facilities": ["Parking", "Changing Room"],
    "description": "Well maintained cricket ground",
    "image": "image_url",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST /api/turfs (Admin Only)
Create new turf.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name`: Turf name
- `location`: Turf location
- `sportType`: Sport type
- `price`: Price per hour
- `facilities`: Facilities (comma-separated)
- `description`: Turf description
- `image`: Image file

**Response:**
```json
{
  "message": "Turf created successfully",
  "turf": {
    "id": "turf_id",
    "name": "New Turf",
    "location": "Location",
    "sportType": "Cricket",
    "price": 500,
    "facilities": ["Parking"],
    "description": "Description",
    "image": "image_url"
  }
}
```

### PUT /api/turfs/:id (Admin Only)
Update turf information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** (same as create)

**Response:**
```json
{
  "message": "Turf updated successfully",
  "turf": { ... }
}
```

### DELETE /api/turfs/:id (Admin Only)
Delete turf.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Turf deleted successfully"
}
```

---

## Booking Endpoints

### POST /api/bookings/create
Create new booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "turfId": "turf_id",
  "date": "2025-01-15",
  "bookingType": "slot|custom",
  "timeSlot": "6:00 AM - 8:00 AM", // for slot booking
  "startTime": "14:00", // for custom booking
  "endTime": "16:00", // for custom booking
  "specialRequests": "Optional special requests"
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "booking_id",
    "turfId": "turf_id",
    "turfName": "Green Valley Turf",
    "userId": "user_id",
    "date": "2025-01-15",
    "bookingType": "slot",
    "timeSlot": "6:00 AM - 8:00 AM",
    "totalAmount": 1000,
    "status": "created",
    "specialRequests": "Optional requests"
  }
}
```

### GET /api/bookings/user
Get user's bookings.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "bookings": [
    {
      "id": "booking_id",
      "turfId": "turf_id",
      "turfName": "Green Valley Turf",
      "date": "2025-01-15",
      "bookingType": "slot",
      "timeSlot": "6:00 AM - 8:00 AM",
      "totalAmount": 1000,
      "status": "confirmed|cancelled|completed",
      "specialRequests": "Optional requests",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /api/bookings/cancel/:bookingId
Cancel user's booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Booking cancelled successfully"
}
```

### GET /api/bookings/all (Admin/Owner Only)
Get all bookings.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "bookings": [
    {
      "id": "booking_id",
      "userId": "user_id",
      "userName": "John Doe",
      "turfId": "turf_id",
      "turfName": "Green Valley Turf",
      "date": "2025-01-15",
      "bookingType": "slot",
      "timeSlot": "6:00 AM - 8:00 AM",
      "totalAmount": 1000,
      "status": "confirmed",
      "specialRequests": "Optional requests"
    }
  ]
}
```

### PUT /api/bookings/status/:bookingId (Admin/Owner Only)
Update booking status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "confirmed|cancelled|completed"
}
```

**Response:**
```json
{
  "message": "Booking status updated successfully"
}
```

---

## Comment Endpoints

### GET /api/comments/:turfId
Get all visible comments for a turf.

**Response:**
```json
{
  "comments": [
    {
      "id": "comment_id",
      "userId": {
        "fullName": "John Doe",
        "username": "johndoe"
      },
      "turfId": "turf_id",
      "comment": "Great turf for cricket!",
      "rating": 5,
      "isVisible": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/comments
Create new comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "turfId": "turf_id",
  "comment": "Excellent facilities!",
  "rating": 5
}
```

**Response:**
```json
{
  "id": "comment_id",
  "userId": {
    "fullName": "John Doe",
    "username": "johndoe"
  },
  "turfId": "turf_id",
  "comment": "Excellent facilities!",
  "rating": 5,
  "isVisible": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### PUT /api/comments/:id
Update user's comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "comment": "Updated comment",
  "rating": 4
}
```

**Response:**
```json
{
  "id": "comment_id",
  "comment": "Updated comment",
  "rating": 4
}
```

### DELETE /api/comments/:id
Delete user's comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

### GET /api/comments/:turfId/all (Admin Only)
Get all comments including hidden ones.

**Headers:**
```
Authorization: Bearer <token>
```

### PUT /api/comments/:id/moderate (Admin Only)
Moderate comment visibility.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isVisible": true|false
}
```

**Response:**
```json
{
  "message": "Comment moderated successfully"
}
```

### DELETE /api/comments/:id/admin (Admin Only)
Admin delete any comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Comment deleted by admin successfully"
}
```

---

## Payment Endpoints

### POST /api/payments/process
Process payment for booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "paymentMethod": "credit_card|debit_card|upi",
  "cardDetails": {
    "cardNumber": "1234567890123456",
    "expiryDate": "12/25",
    "cvv": "123",
    "cardHolderName": "John Doe"
  }
}
// For UPI:
{
  "bookingId": "booking_id",
  "paymentMethod": "upi",
  "cardDetails": {
    "upiId": "user@upi"
  }
}
```

**Response:**
```json
{
  "message": "Payment successful! Receipt sent to your email.",
  "payment": {
    "id": "payment_id",
    "bookingId": "booking_id",
    "amount": 1000,
    "paymentMethod": "credit_card",
    "status": "completed",
    "transactionId": "txn_123456"
  }
}
```

### GET /api/payments/status/:bookingId
Get payment status for booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "payment": {
    "id": "payment_id",
    "bookingId": "booking_id",
    "amount": 1000,
    "paymentMethod": "credit_card",
    "status": "completed|pending|failed",
    "transactionId": "txn_123456",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Access token is required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

## File Upload

- Supported formats: JPEG, PNG, JPG
- Maximum file size: 5MB
- Upload endpoint: `/api/turfs` (for turf images)

## WebSocket Support

Real-time updates for:
- Booking status changes
- New comments on turfs
- Payment confirmations

---

*Last updated: November 12, 2025*