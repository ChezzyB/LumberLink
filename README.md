# LumberLink API Documentation

A comprehensive lumber trading platform that connects mill owners with buyers, built with React Native (Expo) and Node.js.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [User Workflows](#user-workflows)
- [Database Models](#database-models)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

## Overview

LumberLink is a B2B marketplace for lumber products where:
- Mill owners can register their mills and list lumber inventory
- Buyers can browse available lumber and place orders
- Real-time inventory management and order processing
- Location-based mill discovery

## Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Context API** for state management
- **Expo Router** for navigation
- **Jest** for testing

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **bcrypt** for password hashing
- **Jest** for testing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LumberLink
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npx expo start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-01-18T00:00:00.000Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-01-18T00:00:00.000Z"
  }
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### Mill Routes (`/api/mills`)

#### Create Mill
```http
POST /api/mills
Authorization: Bearer <token>
Content-Type: application/json

{
  "millNumber": "M001",
  "name": "Pacific Sawmill",
  "location": {
    "city": "Vancouver",
    "province": "BC",
    "latitude": 49.2827,
    "longitude": -123.1207
  },
  "contact": {
    "phone": "604-555-0123",
    "email": "info@pacificsawmill.com"
  },
  "owner": "user-id"
}
```

#### Get All Mills
```http
GET /api/mills
Authorization: Bearer <token>
```

#### Get Mills by Owner
```http
GET /api/mills?owner=user-id
Authorization: Bearer <token>
```

#### Get Mill by ID
```http
GET /api/mills/id/:id
Authorization: Bearer <token>
```

#### Update Mill
```http
PUT /api/mills/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Mill Name",
  "contact": {
    "phone": "604-555-9999"
  }
}
```

#### Delete Mill
```http
DELETE /api/mills/:id
Authorization: Bearer <token>
```

### Inventory Routes (`/api/inventory`)

#### Create Inventory
```http
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "millId": "mill-id",
  "length": "8'",
  "dimensions": "2x4",
  "species": "SPF",
  "grade": "#2 and better",
  "dryingLevel": "KDHT",
  "manufactureDate": "2025-01-18T00:00:00.000Z",
  "quantity": 100,
  "unit": "pieces",
  "price": {
    "amount": 5.50,
    "type": "per piece"
  },
  "notes": "Premium grade lumber"
}
```

#### Get All Inventory
```http
GET /api/inventory
Authorization: Bearer <token>
```

#### Get Inventory by Mill
```http
GET /api/inventory/mill/:millId
Authorization: Bearer <token>
```

#### Update Inventory
```http
PUT /api/inventory/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 85,
  "price": {
    "amount": 6.00,
    "type": "per piece"
  }
}
```

#### Delete Inventory
```http
DELETE /api/inventory/:id
Authorization: Bearer <token>
```

### Order Routes (`/api/orders`)

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id",
  "items": [
    {
      "inventoryId": "inventory-id",
      "quantity": 10
    }
  ],
  "totalAmount": 55.00
}
```

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get Orders by User
```http
GET /api/orders/user/:userId
Authorization: Bearer <token>
```

#### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "fulfilled"
}
```

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
```

#### Delete Order
```http
DELETE /api/orders/:id
Authorization: Bearer <token>
```

### User Routes (`/api/users`)

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

## User Workflows

### 1. Creating an Account

**Step-by-step process:**

1. **Open the app** and navigate to the Register tab
2. **Fill in the registration form:**
   - Username (must be unique)
   - Email address (must be unique)
   - Password (minimum 6 characters)
3. **Tap "Register"** button
4. **System validation:**
   - Checks if email/username already exists
   - Validates password strength
   - Normalizes email to lowercase
5. **Account creation:**
   - Password is hashed using bcrypt
   - User record created in database
   - JWT token generated and returned
6. **Auto-login:** User is automatically logged in after registration
7. **Navigation:** Redirected to Mills screen

**Error handling:**
- "User with this email or username already exists"
- "Please fill in all fields"
- Network connection errors

### 2. Logging In

**Step-by-step process:**

1. **Open the app** and navigate to the Login tab
2. **Enter credentials:**
   - Email address
   - Password
3. **Tap "Login"** button
4. **System validation:**
   - Normalizes email to lowercase
   - Finds user in database
   - Compares password with stored hash
5. **Authentication:**
   - JWT token generated on successful login
   - Token stored in AsyncStorage
   - User data cached locally
6. **Navigation:** Redirected to Mills screen
7. **Tab visibility:** Authenticated tabs become visible

**Error handling:**
- "Invalid credentials" for wrong email/password
- "Please fill in all fields" for empty fields
- Network connection errors

### 3. Creating a Mill

**Step-by-step process:**

1. **Navigate to "My Mills"** tab
2. **Tap "Add Mill"** button
3. **Fill in mill information:**
   - Mill Number (unique identifier)
   - Mill Name
   - Location (City, Province, Latitude, Longitude)
   - Contact Information (Phone, Email - optional)
4. **Tap "Save"** button
5. **System validation:**
   - Validates required fields
   - Checks latitude/longitude are valid numbers
   - Verifies mill number uniqueness
6. **Mill creation:**
   - Mill record created with owner set to current user
   - Mill appears in owned mills list
7. **Success confirmation:** "Mill created successfully" alert

**Error handling:**
- "Please fill in all required fields"
- "Please enter valid latitude and longitude"
- "Mill number already exists"

### 4. Adding Inventory to a Mill

**Step-by-step process:**

1. **Navigate to "My Mills"** tab
2. **Find your mill** in the list
3. **Tap "Add Inventory"** button on the mill card
4. **Fill in inventory details:**
   - Length (8', 10', 12', etc.)
   - Dimensions (2x4, 2x6, 2x8, etc.)
   - Species (SPF, Douglas Fir, etc.)
   - Grade (#2 and better, #3, etc.)
   - Drying Level (KDHT, HT, GR)
   - Quantity (number)
   - Unit (pieces, bundles, mbf)
   - Price Amount (decimal)
   - Price Type (per piece, per board foot)
   - Notes (optional)
5. **Tap "Add"** button
6. **System validation:**
   - Validates all required fields
   - Checks quantity and price are valid numbers
   - Ensures quantity > 0 and price > 0
7. **Inventory creation:**
   - Inventory record created linked to mill
   - Manufacture date set to current date
8. **Success confirmation:** "Inventory added successfully" alert

**Error handling:**
- "Please fill in all required fields"
- "Please enter a valid quantity"
- "Please enter a valid price"

### 5. Selecting a Mill to View Inventory

**Step-by-step process:**

1. **Navigate to "Mills"** tab
2. **Browse available mills** in the list
3. **Tap "Select Mill"** button on desired mill
4. **Mill selection:**
   - Mill context updated globally
   - Selected mill stored in MillContext
5. **Navigate to "Inventory"** tab
6. **Automatic inventory loading:**
   - App fetches inventory for selected mill
   - Displays list of available lumber products
7. **View inventory details:**
   - Each item shows specifications, quantity, price
   - "Add to Cart" button available for each item

**Features:**
- Search functionality to find specific mills
- Location-based sorting
- Mill details including contact information

### 6. Placing an Order

**Step-by-step process:**

1. **Navigate to "Inventory"** tab (with mill selected)
2. **Browse available inventory** items
3. **Select desired items:**
   - Tap "Add to Cart" on inventory item
   - Specify quantity in the modal
   - Tap "Add to Cart" to confirm
4. **Review cart:**
   - Cart icon shows number of items
   - Can modify quantities or remove items
5. **Place order:**
   - Tap "Place Order" button
   - Review order summary and total
   - Confirm the order
6. **System processing:**
   - Validates inventory availability
   - Checks requested quantity ≤ available quantity
   - Decreases inventory quantities
   - Creates order record with "pending" status
7. **Order confirmation:**
   - Order appears in user's order history
   - "Order placed successfully" confirmation

**Error handling:**
- "Not enough quantity available"
- "Please select items before placing order"
- Network connection errors

### 7. Cancelling an Order

**Step-by-step process:**

1. **Navigate to "Orders"** tab
2. **Find the order** to cancel
3. **Tap "Cancel Order"** button
4. **Confirmation dialog:**
   - "Are you sure you want to cancel this order?"
   - Tap "Cancel Order" to confirm
5. **System processing:**
   - Updates order status to "cancelled"
   - Restores inventory quantities
   - Sends confirmation
6. **Order updated:**
   - Order status changes to "Cancelled"
   - Inventory becomes available again
7. **Success confirmation:** "Order cancelled successfully"

**Restrictions:**
- Only pending orders can be cancelled
- Fulfilled orders cannot be cancelled

### 8. Editing User Information

**Step-by-step process:**

1. **Navigate to "Account"** tab
2. **Tap "Edit Profile"** button
3. **Edit user information:**
   - Username
   - Email address
4. **Tap "Save"** button
5. **System validation:**
   - Checks if new username/email already exists
   - Validates email format
6. **Profile update:**
   - User record updated in database
   - Local user context refreshed
7. **Success confirmation:** "Profile updated successfully"

**Additional account features:**
- **Change Password:**
  - Tap "Change Password"
  - Enter current password
  - Enter new password (minimum 6 characters)
  - Confirm new password
- **View Owned Mills:**
  - Shows count of owned mills
  - "Manage Mills" button navigates to My Mills tab
- **Logout:**
  - Tap "Logout" button
  - Confirmation dialog
  - Clears authentication data and redirects to login

## Database Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique, lowercase),
  passwordHash: String (required),
  createdAt: Date (default: now)
}
```

### Mill Model
```javascript
{
  _id: ObjectId,
  millNumber: String (required, unique),
  name: String (required),
  location: {
    city: String (required),
    province: String (required),
    latitude: Number (required),
    longitude: Number (required)
  },
  contact: {
    phone: String (optional),
    email: String (optional)
  },
  owner: ObjectId (ref: User, optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Inventory Model
```javascript
{
  _id: ObjectId,
  millId: ObjectId (ref: Mill, required),
  length: String (enum: ["8'", "10'", "12'", ...]),
  dimensions: String (enum: ["2x4", "2x6", "2x8", ...]),
  species: String (enum: ["SPF", "Douglas Fir", ...]),
  grade: String (enum: ["#2 and better", "#3", ...]),
  dryingLevel: String (enum: ["KDHT", "HT", "GR"]),
  manufactureDate: Date (required),
  quantity: Number (required),
  unit: String (enum: ["pieces", "bundles", "mbf"]),
  price: {
    amount: Number (required),
    type: String (enum: ["per piece", "per board foot"])
  },
  notes: String (optional),
  createdAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  items: [{
    inventoryId: ObjectId (ref: Inventory, required),
    quantity: Number (required)
  }],
  status: String (enum: ["pending", "fulfilled", "cancelled"]),
  totalAmount: Number (required),
  orderedAt: Date (default: now)
}
```

## Environment Variables

### Backend (.env)
```bash
# Database
MONGO_URI=mongodb://localhost:27017/lumberlink
MONGO_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/lumberlink

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```bash
# API Configuration
API_BASE_URL=http://localhost:5000/api

# External APIs
WEATHER_API_KEY=your-weather-api-key
```

## Testing

### Running Tests

**Backend Tests:**
```bash
cd Backend
npm test
```

**Frontend Tests:**
```bash
cd Frontend
npm test
```

### Test Coverage

**Backend:**
- Unit tests for controllers
- Integration tests for API endpoints
- Model validation tests

**Frontend:**
- Component rendering tests
- Context state management tests
- Business logic tests
- Hook functionality tests

## API Response Formats

### Success Response
```json
{
  "data": { /* response data */ },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [your-email@example.com] or create an issue in the GitHub
