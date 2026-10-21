# Bizora — AI-Powered Digital Business Platform for Small Businesses

Bizora enables small business owners to create and manage digital storefronts, manage multiple businesses through one account, list products, process orders, communicate with customers in real-time, and view sales analytics. Customers can discover businesses through a shared marketplace, browse products, contact sellers, and place orders.

---

## Repository Structure

```
Bizora/
├── backend/                 # Node.js, Express, Sequelize ORM & MySQL backend
│   ├── src/                 # Application source code
│   ├── tests/               # Unit and integration test suites
│   ├── docs/                # Architecture, API guide, security, deployment guides
│   ├── uploads/             # Media upload directory
│   └── package.json
├── frontend/                # Web application storefront (developed separately)
├── docs/                    # Platform documentation
└── README.md
```

---

## Backend Features

- **Runtime & Framework**: Node.js LTS, Express.js with native ES Modules.
- **Database & ORM**: MySQL with Sequelize ORM.
- **Schema Management**: 100% version-controlled Sequelize migrations (`npm run db:migrate`), without raw SQL scripts.
- **Security & Auth**: JWT access tokens, refresh token rotation/revocation, bcrypt password hashing, Helmet, CORS, and rate limiting.
- **Business Management**: Multi-business management per account, custom themes, and marketplace discovery.
- **Product Catalog**: Inventory tracking, categories, price validation with `DECIMAL` precision.
- **Transactional Orders**: Row-level locking to eliminate race conditions/overselling, server-calculated totals, and automatic inventory rollback on cancellation.
- **Real-Time Communication**: Socket.IO room-isolated chat with database persistence.
- **File Uploads**: Multer image upload with MIME validation, safe unique filenames, and orphaned file cleanup.
- **Analytics**: Monthly revenue trends, order status breakdown, and top-selling products using Sequelize aggregations.
- **Interactive Documentation**: Swagger / OpenAPI UI at `/api-docs` and Postman collection at `backend/docs/Bizora_API_Collection.postman_collection.json`.
- **Automated Testing**: Comprehensive unit and integration tests using Vitest and Supertest (`npm test`).

For detailed backend setup, instructions, and architecture documents, refer to [backend/README.md](file:///c:/Users/Srinila/OneDrive/Documents/Gwc_12_weeks/Week%207/Bizora/backend/README.md).

