# Bizora API Guide

## 1. Base URL & Versioning

- Base URL: `http://localhost:5000/api/v1`
- Interactive OpenAPI / Swagger UI: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`

## 2. Standardized Response Format

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "item": {}
  }
}
```

### Failure Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "message": "Human readable explanation of the failure",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address",
        "value": "invalid-email"
      }
    ]
  }
}
```

## 3. Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register`: Register new customer or business owner.
- `POST /login`: Authenticate and obtain JWT access & refresh tokens.
- `POST /refresh`: Rotate refresh token and get a new access token.
- `POST /logout`: Revoke active session refresh token.
- `POST /logout-all`: Revoke all sessions across all devices.
- `GET /me`: Get current authenticated user profile.
- `PATCH /me`: Update profile (name, phone, avatar).
- `PATCH /change-password`: Update password securely.
- `POST /forgot-password`: Request password reset (enumeration-safe).
- `POST /reset-password`: Reset password using verified token.
- `POST /verify-email`: Verify email address with token.
- `POST /resend-verification`: Resend email verification token.

### Businesses (`/api/v1/businesses`)
- `GET /`: List published storefronts in marketplace (search, category, page, limit).
- `GET /my`: List businesses owned by authenticated user.
- `POST /`: Create a new business storefront.
- `GET /:id`: Retrieve business details by ID or slug.
- `PATCH /:id`: Update business information.
- `DELETE /:id`: Archive a business.
- `POST /:id/toggle-publish`: Toggle marketplace visibility.
- `PATCH /:id/theme`: Update theme colors, font, and storefront layout.
- `GET /:id/analytics`: Retrieve monthly sales trends, order status breakdown, and best-selling products.

### Products & Categories (`/api/v1/products`, `/api/v1/categories`)
- `GET /products`: List products with multi-filter (search, price range, inStock, businessId, categoryId).
- `POST /products`: Create product (business owner only).
- `GET /products/:id`: Get product details.
- `PATCH /products/:id`: Update product attributes or stock.
- `DELETE /products/:id`: Delete product.
- `GET /categories`: List categories.
- `POST /categories`: Create category.
- `PATCH /categories/:id`: Update category.
- `DELETE /categories/:id`: Delete category.

### Orders (`/api/v1/orders`)
- `POST /`: Place order with transactional inventory reservation.
- `GET /`: List customer orders.
- `GET /:id`: Get authorized order details.
- `GET /business/:businessId`: List orders for merchant storefront.
- `PATCH /:id/status`: Update fulfillment status (confirmed, processing, shipped, delivered, cancelled).
- `POST /:id/cancel`: Cancel order and automatically restore stock.

### Payments (`/api/v1/payments`)
- `GET /order/:orderId`: Get payment records and status history.
- `POST /process`: Process payment transaction through provider boundary.

### Uploads (`/api/v1/uploads`)
- `POST /avatar`: Upload user avatar image.
- `POST /business-asset`: Upload business logo or banner.
- `POST /products`: Upload multiple product photos.

### Reviews & Wishlist (`/api/v1/reviews`, `/api/v1/wishlist`)
- `GET /reviews/product/:productId`: Get product reviews.
- `POST /reviews`: Create review (flags verified purchaser).
- `DELETE /reviews/:id`: Delete review.
- `GET /wishlist`: Get user's saved wishlist products.
- `POST /wishlist`: Add product to wishlist.
- `DELETE /wishlist/:productId`: Remove product from wishlist.

### Real-Time Chat (`/api/v1/chat`)
- `GET /conversations`: Get active conversation threads.
- `POST /conversations`: Start conversation with business.
- `GET /conversations/:id/messages`: Get message history.
- `POST /conversations/:id/messages`: Send chat message.
- `PATCH /conversations/:id/read`: Mark messages as read.

### Notifications (`/api/v1/notifications`)
- `GET /`: List user notifications (orders, messages, stock alerts).
- `PATCH /:id/read`: Mark notification as read.
- `PATCH /read-all`: Mark all notifications as read.

