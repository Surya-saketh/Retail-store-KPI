# Retail KPI Backend API Documentation

## Overview
This backend system provides a complete billing and product management solution with role-based access control.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles
- **user**: Can create bills, view their own bills, search products
- **manager**: All user permissions + manage products, view all bills, access statistics

## Default Users
```
Username: admin, Password: admin123, Role: manager
Username: cashier1, Password: cashier123, Role: user  
Username: manager1, Password: manager123, Role: manager
```

---

## Authentication Endpoints

### POST /auth/login
Login with username/email and password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@retailkpi.com",
    "role": "manager"
  }
}
```

### POST /auth/register
Register a new user (for demo purposes).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

### GET /auth/profile
Get current user profile (requires authentication).

### POST /auth/logout
Logout current user (requires authentication).

---

## Product Management Endpoints

### GET /products
Get all products with optional search and pagination.

**Query Parameters:**
- `search`: Search in name, description, or SKU
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `category`: Filter by category

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Soap Bar",
      "description": "Premium soap bar",
      "price": 2.50,
      "stock_quantity": 100,
      "category": "Personal Care",
      "sku": "SOAP001",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

### GET /products/autocomplete
Get product suggestions for autocomplete (requires authentication).

**Query Parameters:**
- `q`: Search query (minimum 1 character)

**Response:**
```json
{
  "suggestions": [
    {
      "id": 1,
      "name": "Soap Bar",
      "price": 2.50,
      "stock": 100
    }
  ]
}
```

### GET /products/:id
Get single product details.

### POST /products
Create new product (managers only).

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 10.99,
  "stock_quantity": 50,
  "category": "Category Name",
  "sku": "PROD001"
}
```

### PUT /products/:id
Update existing product (managers only).

### DELETE /products/:id
Delete product (managers only). Cannot delete products used in bills.

### GET /products/meta/categories
Get all available product categories.

---

## Billing Endpoints

### GET /billing
Get bills with optional filters.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (pending, completed, cancelled)
- `user_id`: Filter by user ID (managers only)
- `date_from`: Filter from date (YYYY-MM-DD)
- `date_to`: Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "bills": [
    {
      "id": 1,
      "bill_number": "BILL-1640995200000-ABC12",
      "user_id": 1,
      "username": "admin",
      "email": "admin@retailkpi.com",
      "total_amount": 15.50,
      "status": "pending",
      "item_count": 3,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET /billing/:id
Get single bill with all items.

**Response:**
```json
{
  "bill": {
    "id": 1,
    "bill_number": "BILL-1640995200000-ABC12",
    "user_id": 1,
    "username": "admin",
    "email": "admin@retailkpi.com",
    "total_amount": 15.50,
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "bill_id": 1,
        "product_id": 1,
        "product_name": "Soap Bar",
        "description": "Premium soap bar",
        "sku": "SOAP001",
        "quantity": 2,
        "unit_price": 2.50,
        "total_price": 5.00
      }
    ]
  }
}
```

### POST /billing
Create new bill.

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ]
}
```

**Features:**
- Automatically calculates total amount
- Validates product availability and stock
- Updates product stock quantities
- Generates unique bill number

### PATCH /billing/:id/status
Update bill status.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Statuses:**
- `pending`: Bill created but not finalized
- `completed`: Bill finalized and paid
- `cancelled`: Bill cancelled (restores stock)

### GET /billing/stats/summary
Get billing statistics (managers only).

**Query Parameters:**
- `date_from`: Filter from date (YYYY-MM-DD)
- `date_to`: Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "summary": {
    "total_bills": 50,
    "total_revenue": 1250.75,
    "pending_bills": 5,
    "completed_bills": 45
  },
  "top_products": [
    {
      "name": "Soap Bar",
      "total_quantity": 100,
      "total_revenue": 250.00
    }
  ],
  "daily_sales": [
    {
      "date": "2024-01-01",
      "bill_count": 10,
      "revenue": 125.50
    }
  ]
}
```

---

## Weather API (Existing)

### GET /location
Get weather data and product recommendations.

**Query Parameters:**
- `lat`: Latitude
- `lon`: Longitude

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error

---

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password`: Hashed password
- `role`: user or manager
- `created_at`, `updated_at`: Timestamps

### Products Table
- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Product price (decimal)
- `stock_quantity`: Available stock
- `category`: Product category
- `sku`: Unique stock keeping unit
- `created_at`, `updated_at`: Timestamps

### Bills Table
- `id`: Primary key
- `bill_number`: Unique bill identifier
- `user_id`: Foreign key to users
- `total_amount`: Total bill amount
- `status`: pending, completed, or cancelled
- `created_at`, `updated_at`: Timestamps

### Bill Items Table
- `id`: Primary key
- `bill_id`: Foreign key to bills
- `product_id`: Foreign key to products
- `quantity`: Item quantity
- `unit_price`: Price per unit at time of sale
- `total_price`: Total price for this item

---

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
PORT=5000
WEATHER_API_KEY=your_openweather_api_key
JWT_SECRET=your_jwt_secret_key
```

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

The database will be automatically initialized with sample data on first run.
