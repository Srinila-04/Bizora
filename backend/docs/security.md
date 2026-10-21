# Bizora Backend Security Architecture

## 1. Authentication & Session Management

- **Password Security**: Passwords are cryptographically salted and hashed using `bcrypt` (10 rounds). Complexity enforces min 8 characters with lowercase, uppercase, numbers, and special characters.
- **Short-Lived Access Tokens**: Signed using `HS256` with 15-minute expirations.
- **Refresh Token Rotation**: Issued with 7-day lifespans and persisted as SHA-256 hashes. Every refresh exchange invalidates the old token and returns a fresh pair, detecting and mitigating replay attacks.
- **Mass Logout**: The `/api/v1/auth/logout-all` endpoint revokes all active refresh tokens for the user in the database.
- **Account Enumeration Protection**: The `/api/v1/auth/forgot-password` endpoint returns an identical generic response whether the email exists or not.

## 2. Authorization & RBAC

- Roles: `customer`, `business_owner`, `admin`.
- Role escalation is blocked: registration cannot assign the `admin` role.
- Resource Ownership: Enforced at the service layer and middleware (`requireBusinessOwner`). Users cannot mutate, delete, or inspect businesses, orders, or private conversations belonging to others.

## 3. Database Security

- **Sequelize ORM & Parameterized Queries**: User inputs are strictly bound as parameters to eliminate SQL injection vulnerabilities.
- **Schema Protection**: Schema creation scripts (`schema.sql`, `CREATE TABLE`) and destructive sync operations (`sequelize.sync({ force: true })`) are prohibited. All schema state transitions are recorded through atomic Sequelize migrations.
- **Financial Decimal Precision**: Monetary values are stored as `DECIMAL(10, 2)` to eliminate floating-point arithmetic rounding errors.

## 4. API & Network Protection

- **Helmet**: Hardens HTTP response headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, etc.).
- **Rate Limiting**:
  - Global: 300 requests per 15 minutes per IP.
  - Sensitive Auth Endpoints (`/login`, `/register`, `/forgot-password`): 20 requests per 15 minutes per IP.
- **CORS**: Configurable origin whitelist, credentials support, and explicit HTTP methods.
- **Payload Limits**: Strict 10MB limits on JSON and URL-encoded bodies.

## 5. File Upload Safeguards

- Uploads routed via `Multer` with 5MB maximum file size.
- Whitelisted MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and extensions.
- Unique randomized filenames prevent file collisions and directory traversal attacks.
- Old files are automatically cleaned up when updated.

