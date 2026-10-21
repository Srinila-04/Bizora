# Bizora Backend

**AI-Powered Digital Business Platform for Small Businesses**

Bizora enables small business owners to launch digital storefronts, manage multi-business accounts, process orders, communicate with customers in real time, and view sales analytics.

This repository contains the backend REST API and WebSocket services built with Express.js, Sequelize ORM, and MySQL.

---

## Technology Stack

- **Runtime**: Node.js LTS (v20+ / v22+)
- **Framework**: Express.js
- **Module System**: ES Modules (`"type": "module"`)
- **Database**: MySQL 8.0+
- **ORM**: Sequelize 6 with `mysql2` driver
- **Authentication**: JWT (Access Token + Refresh Token Rotation), bcrypt
- **Validation**: express-validator
- **Real-Time Messaging**: Socket.IO
- **File Uploads**: Multer
- **API Documentation**: OpenAPI 3.0 / Swagger UI at `/api-docs`
- **Testing**: Vitest & Supertest
- **Security**: Helmet, CORS, Rate Limiting, Cookie Parser
- **Logging**: Winston structured logging & Morgan HTTP logger

---

## Getting Started

### 1. Configure Environment

Copy `.env.example` to `.env` inside `backend/`:

```bash
cp .env.example .env
```

Ensure your `.env` contains your MySQL database credentials:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=bizora

JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

> **Note**: The backend connects to your existing MySQL database named `bizora`. Do not run SQL schema scripts or recreate the database. All table creation and updates are performed through Sequelize migrations.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Database Migrations

Apply all versioned Sequelize migrations to create the database schema:

```bash
npm run db:migrate
```

To check migration status:

```bash
npm run db:migrate:status
```

To insert optional demo development data:

```bash
npm run db:seed
```

### 4. Run Automated Tests

Run the full suite of unit and integration tests:

```bash
npm test
```

### 5. Start the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production start:

```bash
npm start
```

---

## API Documentation & Endpoints

- **Swagger UI**: Visit `http://localhost:5000/api-docs` in your browser.
- **Health Check**: `GET http://localhost:5000/health`
- **Postman Collection**: Available at `backend/docs/Bizora_API_Collection.postman_collection.json`.

---

## Folder Structure

```
backend/
├── src/
│   ├── app.js                   # Express app setup with security middlewares
│   ├── server.js                # Server entry point with Socket.IO & graceful shutdown
│   ├── config/
│   │   ├── env.js               # Environment variables loader & validator
│   │   ├── database.js          # Sequelize MySQL connection pool
│   │   ├── cors.js              # CORS policy
│   │   └── sequelize-cli.cjs    # CLI configuration
│   ├── database/
│   │   ├── models/              # Sequelize models & associations
│   │   ├── migrations/          # Incremental Sequelize migrations
│   │   ├── seeders/             # Safe development seeders
│   │   ├── migrate.js           # Transactional migration runner
│   │   ├── seed.js              # Seeder runner
│   │   └── index.js             # Database entry re-export
│   ├── routes/                  # API routers (auth, businesses, products, orders, chat, etc.)
│   ├── controllers/             # Request handlers & response formatters
│   ├── services/                # Business logic, calculations & transactions
│   ├── middleware/              # Auth, RBAC, upload, error, rate-limiter
│   ├── validators/              # Express-validator schemas
│   ├── sockets/                 # Socket.IO chat handlers & authentication
│   ├── utils/                   # ApiResponse, ApiError, logger, token helpers
│   ├── constants/               # Roles, order status, payment status
│   └── docs/                    # OpenAPI Swagger specification
├── tests/
│   ├── unit/                    # Unit tests for tokens, models & calculations
│   └── integration/             # Integration tests for auth, business, orders, chat, security
├── uploads/                     # Uploaded images directory
├── docs/                        # Technical architecture & deployment guides
├── .env                         # Environment variables (git-ignored)
├── .env.example                 # Environment variables template
├── .gitignore
├── .sequelizerc
├── package.json
└── README.md
```

