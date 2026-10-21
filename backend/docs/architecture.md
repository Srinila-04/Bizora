# Bizora Backend Architecture Document

## 1. System Overview

**Bizora** is an AI-powered digital business platform engineered for small businesses. It enables independent merchants to set up digital storefronts, manage multi-business accounts, process orders, communicate with customers in real time, and analyze sales performance.

The backend is built as an enterprise-grade REST and WebSocket service using Node.js, Express, Sequelize ORM, and MySQL.

```
+-------------------------------------------------------------+
|                      Clients                                |
|        (React / Mobile Storefronts / Admin Dashboards)       |
+-------------------------------------------------------------+
                              |
               +--------------+--------------+
               | HTTP / REST                 | WebSocket (Socket.IO)
               v                             v
+-------------------------------------------------------------+
|               Express Application Layer                     |
|  - Helmet / Security Headers                                |
|  - Rate Limiting (Global & Sensitive Endpoints)             |
|  - CORS & Cookie Parsers                                    |
|  - Request Validation (Express-Validator)                   |
|  - JWT Authentication & Role-Based Access Control           |
+-------------------------------------------------------------+
               |                             |
               v                             v
+-----------------------------+ +-----------------------------+
|     Controllers Layer       | |      Sockets Layer          |
|  - Request dispatching      | |  - Handshake JWT Auth       |
|  - Response formatting      | |  - Room Isolation           |
|  - Error propagation        | |  - Event broadcasting       |
+-----------------------------+ +-----------------------------+
               |                             |
               +--------------+--------------+
                              |
                              v
+-------------------------------------------------------------+
|                      Services Layer                         |
|  - Business logic & calculations                            |
|  - Stock reservation & transactional management             |
|  - Slug generation & password hashing                       |
|  - Audit logging & notification triggers                    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|              Data Access Layer (Sequelize ORM)              |
|  - Connection Pooling (Max 10, Min 0)                       |
|  - Explicit Model Definitions & Associations                |
|  - Transactional Isolation (FOR UPDATE locks)               |
|  - Migrations Tracker (SequelizeMeta)                       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                   MySQL Database (`bizora`)                 |
+-------------------------------------------------------------+
```

## 2. Layered Architecture Principles

1. **Separation of Concerns**:
   - **Routes**: Define URL paths, HTTP methods, route-level rate limiting, and validator middlewares.
   - **Controllers**: Handle HTTP-specific input extraction, invoke appropriate services, and serialize uniform JSON responses via `ApiResponse`.
   - **Services**: Contain pure business logic, calculations, inventory operations, and database transactions.
   - **Data Access**: Sequelize models and migrations exclusively; strictly no standalone SQL files or raw DDL queries.

2. **State and Token Architecture**:
   - Short-lived JSON Web Access Tokens (`15m`) for stateless authorization.
   - Cryptographically hashed Refresh Tokens (`7d`) stored in the `refresh_tokens` database table with automatic rotation on each refresh request to mitigate replay attacks.

3. **Concurrency and Data Integrity**:
   - High-concurrency operations (e.g., placing an order, inventory deduction, order cancellations) execute within strict `sequelize.transaction()` blocks using row-level locking (`LOCK.UPDATE`).

