# Bizora Database Design Document

## 1. Schema & Engine

- **Database Engine**: MySQL 8.0+
- **Default Storage Engine**: InnoDB
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **ORM**: Sequelize 6 with ES Modules
- **Schema Management**: Sequelize Migrations (`src/database/migrations/`). No raw SQL schema scripts (`schema.sql`) are used.

## 2. Entity-Relationship Summary

| Entity | Primary Key | Description | Key Foreign Keys |
| :--- | :--- | :--- | :--- |
| `users` | UUID | Platform users (customers, business owners, admins) | None |
| `refresh_tokens` | UUID | Hashed refresh tokens for session rotation | `userId -> users.id` (CASCADE) |
| `businesses` | UUID | Merchant digital storefronts | `ownerId -> users.id` (CASCADE) |
| `categories` | UUID | Scoped or global product groupings | `businessId -> businesses.id` (CASCADE) |
| `products` | UUID | Merchant merchandise items with DECIMAL prices | `businessId -> businesses.id`, `categoryId -> categories.id` |
| `orders` | UUID | Single-business customer orders | `businessId -> businesses.id`, `customerId -> users.id` |
| `order_items` | UUID | Immutable snapshot of product details & quantity | `orderId -> orders.id` (CASCADE), `productId -> products.id` |
| `payments` | UUID | Monetary payment records | `orderId -> orders.id`, `businessId -> businesses.id`, `customerId -> users.id` |
| `payment_status_histories` | UUID | Audit trail of payment state changes | `paymentId -> payments.id` (CASCADE) |
| `order_status_histories` | UUID | Audit trail of order fulfillment progression | `orderId -> orders.id` (CASCADE) |
| `reviews` | UUID | Customer product ratings & verified purchase status | `productId -> products.id`, `customerId -> users.id`, `businessId -> businesses.id` |
| `wishlists` | UUID | Customer saved items (unique per customer + product) | `customerId -> users.id`, `productId -> products.id` |
| `conversations` | UUID | Chat threads between customer and business | `businessId -> businesses.id`, `customerId -> users.id` |
| `messages` | UUID | Real-time chat messages with read timestamps | `conversationId -> conversations.id`, `senderId -> users.id` |
| `notifications` | UUID | In-app notification messages | `userId -> users.id` (CASCADE) |
| `audit_logs` | UUID | Security and state audit tracking | `userId -> users.id` (SET NULL) |

## 3. Data Integrity & Financial Precision

1. **Monetary Values**:
   - `DECIMAL(10, 2)` is applied uniformly to `price`, `compareAtPrice`, `costPrice`, `subtotal`, `taxAmount`, `shippingAmount`, `discountAmount`, and `totalAmount`.
   - Floating-point representations (`FLOAT`, `DOUBLE`) are strictly forbidden to prevent decimal inaccuracies.

2. **Snapshot Invariance**:
   - `order_items` captures `productName` and `unitPrice` at the exact moment of order placement, insulating historical receipts against future price changes or product edits.

3. **Concurrency Protection**:
   - `LOCK.UPDATE` transactions in Sequelize prevent stock depletion below zero.

