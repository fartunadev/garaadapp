# TanaCargo E-Commerce Platform - System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [System Requirements](#system-requirements)
5. [Installation Guide](#installation-guide)
6. [Database Schema](#database-schema)
7. [Stored Procedures](#stored-procedures)
8. [API Documentation](#api-documentation)
9. [Security Features](#security-features)
10. [System Advantages](#system-advantages)
11. [Deployment Guide](#deployment-guide)

---

## 1. System Overview

TanaCargo is a modern, full-stack e-commerce platform designed for multi-vendor marketplace operations. The system uses **SQL Server** as the database with stored procedures for all data operations, ensuring security, performance, and maintainability.

### Key Features

- **Multi-Vendor Marketplace**: Support for multiple sellers with individual dashboards
- **Product Management**: Categories, subcategories, variants, inventory tracking
- **Order Management**: Complete order lifecycle with status tracking
- **User Management**: Role-based access control (Admin, Seller, Moderator, User)
- **Review System**: Verified purchase reviews with moderation
- **Marketing Campaigns**: Promotional tools and discount management
- **Secure Payments**: Multiple payment method support
- **Analytics & Reports**: Sales, inventory, and performance metrics
- **SQL Server Backend**: Enterprise-grade database with stored procedures

---

## 2. Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Vite + TypeScript)                             │
│  ├── React Router (SPA Navigation)                              │
│  ├── TanStack Query (Server State Management)                   │
│  ├── Radix UI + Tailwind CSS (UI Components)                    │
│  └── Zod (Client-side Validation)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express Backend                                      │
│  ├── RESTful API Endpoints                                      │
│  ├── JWT Authentication (Access + Refresh Tokens)               │
│  ├── Rate Limiting & Security Middleware                        │
│  ├── Input Validation (Zod)                                     │
│  ├── Stored Procedure Calls (mssql)                             │
│  └── Comprehensive Error Handling                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Microsoft SQL Server 2019+                                     │
│  ├── 20+ Tables with Foreign Key Constraints                    │
│  ├── 60+ Stored Procedures                                      │
│  ├── Triggers for Auto-Update Timestamps                        │
│  ├── Indexes for Query Optimization                             │
│  └── Transaction Support with Rollback                          │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
tanacargo-main/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Configuration (database, app settings)
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, security, validation, errors
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic (calls stored procs)
│   │   ├── utils/             # Helpers, logger, ApiError
│   │   ├── validators/        # Zod schemas
│   │   └── server.js          # Express entry point
│   ├── database/
│   │   ├── schema/            # Table creation scripts
│   │   ├── procedures/        # Stored procedures
│   │   └── seeds/             # Seed data scripts
│   └── package.json
├── src/                        # React Frontend
│   ├── components/            # UI components (Radix-based)
│   ├── contexts/              # Cart, Wishlist contexts
│   ├── hooks/                 # Custom data hooks
│   ├── pages/                 # Page components
│   └── utils/                 # Frontend utilities
└── package.json
```

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Library |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 5.4.19 | Build Tool |
| React Router | 6.30.1 | Navigation |
| TanStack Query | 5.83.0 | Server State |
| Tailwind CSS | 3.4.17 | Styling |
| Radix UI | Latest | Accessible Components |
| Framer Motion | 12.25.0 | Animations |
| Zod | 3.25.76 | Validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.21.0 | Web Framework |
| **mssql** | 11.0.1 | **SQL Server Driver** |
| JWT | 9.0.2 | Authentication |
| Helmet | 7.1.0 | Security Headers |
| Rate Limit | 7.4.0 | Rate Limiting |
| Bcrypt | 5.1.1 | Password Hashing |
| Zod | 3.25.76 | Validation |
| Winston | 3.14.2 | Logging |

### Database

| Technology | Purpose |
|------------|---------|
| **SQL Server 2019+** | Relational Database |
| **Stored Procedures** | Data Operations |
| Triggers | Auto-timestamp updates |
| Indexes | Query optimization |

---

## 4. System Requirements

### Minimum Requirements

#### Development Environment
- **Node.js**: v18.0.0 or higher
- **SQL Server**: 2019 or higher (Express edition is free)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 5GB free space

#### Production Server
- **CPU**: 2 cores minimum
- **RAM**: 8GB minimum
- **Storage**: 50GB SSD
- **OS**: Windows Server 2019+ / Ubuntu with Docker

### SQL Server Installation Options

1. **SQL Server Express** (Free)
   - Download from Microsoft
   - Good for development and small deployments

2. **SQL Server Developer** (Free for development)
   - Full features for testing

3. **Docker Container**
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" \
     -p 1433:1433 --name sqlserver \
     -d mcr.microsoft.com/mssql/server:2022-latest
   ```

---

## 5. Installation Guide

### Step 1: Database Setup

```bash
# Connect to SQL Server using SSMS or sqlcmd
sqlcmd -S localhost -U sa -P YourPassword

# Run the schema creation script
:r backend/database/schema/001_create_tables.sql

# Run all stored procedures
:r backend/database/procedures/sp_auth.sql
:r backend/database/procedures/sp_products.sql
:r backend/database/procedures/sp_orders.sql
:r backend/database/procedures/sp_categories.sql
:r backend/database/procedures/sp_sellers.sql
:r backend/database/procedures/sp_reviews.sql

# Run seed data (optional)
:r backend/database/seeds/seed_data.sql
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd tanacargo-main/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your SQL Server credentials
# DB_SERVER=localhost
# DB_PORT=1433
# DB_NAME=TanaCargo
# DB_USER=sa
# DB_PASSWORD=YourPassword
# JWT_SECRET=your-secret-key-min-32-chars

# Start development server
npm run dev
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd tanacargo-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# SQL Server Database
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=TanaCargo
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5173
```

---

## 6. Database Schema

### Tables Overview (20 Tables)

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User accounts | id, email, password_hash, is_active |
| `profiles` | User profiles | user_id, full_name, phone, avatar_url |
| `user_roles` | Role assignments | user_id, role (admin/seller/user) |
| `refresh_tokens` | JWT refresh tokens | user_id, token, expires_at |
| `sellers` | Seller/store info | user_id, store_name, is_verified |
| `categories` | Product categories | name, slug, image_url |
| `subcategories` | Sub-categories | category_id, name, slug |
| `products` | Product catalog | name, price, stock, category_id |
| `product_images` | Product gallery | product_id, image_url |
| `product_variants` | Size/color variants | product_id, size, color, stock |
| `orders` | Customer orders | user_id, order_number, total, status |
| `order_items` | Order line items | order_id, product_id, quantity |
| `order_status_history` | Status changes | order_id, status, created_at |
| `payments` | Payment records | order_id, amount, status |
| `payouts` | Seller payouts | seller_id, amount, status |
| `reviews` | Product reviews | product_id, user_id, rating |
| `addresses` | Shipping addresses | user_id, address_line1, city |
| `messages` | User messages | sender_id, receiver_id, message |
| `marketing_campaigns` | Promotions | name, discount_code, discount_percent |
| `settings` | System settings | key, value, description |

### Entity Relationship

```
users ─────┬───── profiles
           ├───── user_roles
           ├───── refresh_tokens
           ├───── sellers ──────── products ──────┬── product_images
           │                            │         ├── product_variants
           │                            │         └── reviews
           │                            └──────── categories ── subcategories
           │
           ├───── orders ────────┬── order_items
           │                     ├── order_status_history
           │                     └── payments
           │
           ├───── addresses
           └───── messages
```

---

## 7. Stored Procedures

### Authentication (sp_auth.sql)

| Procedure | Description |
|-----------|-------------|
| `sp_RegisterUser` | Create new user with profile and role |
| `sp_LoginUser` | Get user credentials for login |
| `sp_GetUserById` | Get user profile by ID |
| `sp_GetUserByEmail` | Get user by email |
| `sp_UpdateUserProfile` | Update user profile |
| `sp_UpdatePassword` | Change user password |
| `sp_SaveRefreshToken` | Store refresh token |
| `sp_ValidateRefreshToken` | Validate refresh token |
| `sp_RevokeRefreshToken` | Revoke single token |
| `sp_RevokeAllUserTokens` | Revoke all user tokens |
| `sp_HasRole` | Check if user has role |
| `sp_AddUserRole` | Add role to user |

### Products (sp_products.sql)

| Procedure | Description |
|-----------|-------------|
| `sp_CreateProduct` | Create new product |
| `sp_GetProductById` | Get product with images/variants |
| `sp_GetProductBySlug` | Get product by URL slug |
| `sp_GetProducts` | Get paginated products with filters |
| `sp_UpdateProduct` | Update product details |
| `sp_DeleteProduct` | Soft delete product |
| `sp_UpdateProductStock` | Increase/decrease stock |
| `sp_GetFlashDeals` | Get flash deal products |
| `sp_GetTrendingProducts` | Get trending products |
| `sp_AddProductImage` | Add product image |
| `sp_DeleteProductImage` | Remove product image |
| `sp_CreateProductVariant` | Create size/color variant |
| `sp_UpdateProductVariant` | Update variant |
| `sp_DeleteProductVariant` | Remove variant |
| `sp_UpdateProductRating` | Recalculate product rating |

### Orders (sp_orders.sql)

| Procedure | Description |
|-----------|-------------|
| `sp_CreateOrder` | Create new order |
| `sp_AddOrderItem` | Add item to order |
| `sp_GetOrderById` | Get order with items/history |
| `sp_GetOrderByNumber` | Get order by order number |
| `sp_GetUserOrders` | Get user's orders |
| `sp_GetAllOrders` | Get all orders (admin) |
| `sp_UpdateOrderStatus` | Update status with history |
| `sp_UpdatePaymentStatus` | Update payment status |
| `sp_CancelOrder` | Cancel order and restore stock |
| `sp_GetOrderStats` | Get order statistics |
| `sp_GetRecentOrders` | Get recent orders |
| `sp_CreatePayment` | Create payment record |
| `sp_UpdatePayment` | Update payment status |

### Categories (sp_categories.sql)

| Procedure | Description |
|-----------|-------------|
| `sp_CreateCategory` | Create category |
| `sp_GetAllCategories` | Get all categories |
| `sp_GetCategoryById` | Get category with subcategories |
| `sp_GetCategoryBySlug` | Get category by slug |
| `sp_UpdateCategory` | Update category |
| `sp_DeleteCategory` | Delete/deactivate category |
| `sp_CreateSubcategory` | Create subcategory |
| `sp_GetSubcategoriesByCategory` | Get subcategories |
| `sp_UpdateSubcategory` | Update subcategory |
| `sp_DeleteSubcategory` | Delete subcategory |

### Sellers (sp_sellers.sql)

| Procedure | Description |
|-----------|-------------|
| `sp_RegisterSeller` | Register as seller |
| `sp_GetSellerById` | Get seller profile |
| `sp_GetSellerByUserId` | Get seller by user ID |
| `sp_GetAllSellers` | Get all sellers (admin) |
| `sp_UpdateSeller` | Update seller info |
| `sp_ApproveSeller` | Approve seller |
| `sp_VerifySeller` | Verify seller |
| `sp_DeactivateSeller` | Deactivate seller |
| `sp_UpdateSellerStats` | Update seller statistics |
| `sp_GetSellerDashboardStats` | Get dashboard data |
| `sp_CreatePayoutRequest` | Request payout |
| `sp_GetSellerPayouts` | Get payout history |
| `sp_ProcessPayout` | Process payout (admin) |

### Reviews (sp_reviews.sql)

| Procedure | Description |
|-----------|-------------|
| `sp_CreateReview` | Create product review |
| `sp_GetReviewsByProductId` | Get product reviews |
| `sp_GetProductReviewStats` | Get rating distribution |
| `sp_GetUserReviews` | Get user's reviews |
| `sp_GetAllReviews` | Get all reviews (admin) |
| `sp_UpdateReview` | Update review |
| `sp_DeleteReview` | Delete review |
| `sp_ApproveReview` | Approve review |
| `sp_RejectReview` | Reject review |
| `sp_CanUserReviewProduct` | Check if can review |

---

## 8. API Documentation

### Base URL
```
Development: http://localhost:3001/api/v1
Production: https://api.tanacargo.com/api/v1
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/password` | Change password |

#### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (paginated) |
| GET | `/products/:id` | Get product details |
| GET | `/products/flash-deals` | Get flash deals |
| GET | `/products/trending` | Get trending |
| POST | `/products` | Create product (admin/seller) |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders (admin) |
| GET | `/orders/my-orders` | Get user's orders |
| GET | `/orders/:id` | Get order details |
| POST | `/orders` | Create order |
| PATCH | `/orders/:id/status` | Update status |
| POST | `/orders/:id/cancel` | Cancel order |

---

## 9. Security Features

### Authentication
- **JWT Access Tokens**: 7-day expiry
- **JWT Refresh Tokens**: 30-day expiry, stored in database
- **Password Hashing**: bcrypt with 12 rounds
- **Token Revocation**: Logout revokes all tokens

### API Security
| Feature | Implementation |
|---------|----------------|
| Rate Limiting | 100 req/15min (5/15min for auth) |
| Helmet | 10+ security headers |
| CORS | Whitelist configuration |
| XSS Protection | Input sanitization |
| SQL Injection | Parameterized stored procedures |
| HPP | HTTP Parameter Pollution prevention |

### Database Security
- **Stored Procedures**: No direct SQL, preventing injection
- **Parameterized Queries**: All inputs are parameters
- **Transaction Support**: Rollback on failures
- **Soft Deletes**: Data preservation

---

## 10. System Advantages

### Using SQL Server

| Advantage | Description |
|-----------|-------------|
| **Enterprise-Grade** | Proven reliability for mission-critical apps |
| **Stored Procedures** | Pre-compiled, optimized queries |
| **Transaction Support** | ACID compliance with rollback |
| **Security** | SQL injection prevention by design |
| **Performance** | Query optimization and indexing |
| **Scalability** | Handles large datasets efficiently |
| **Tooling** | SSMS, Azure Data Studio for management |
| **Backup/Recovery** | Built-in backup and restore |

### Using Stored Procedures

| Advantage | Description |
|-----------|-------------|
| **Security** | No SQL in application code |
| **Performance** | Pre-compiled execution plans |
| **Maintainability** | Database logic in one place |
| **Reusability** | Same procedure for multiple apps |
| **Auditing** | Easy to track data changes |
| **Network Efficiency** | Single call vs multiple queries |

### Business Benefits

| Benefit | Description |
|---------|-------------|
| **Multi-Vendor** | Complete marketplace support |
| **Scalable** | Grows with your business |
| **Secure** | Enterprise security standards |
| **Maintainable** | Clean separation of concerns |
| **Extensible** | Easy to add new features |

---

## 11. Deployment Guide

### SQL Server Setup (Production)

```sql
-- Create production database
CREATE DATABASE TanaCargo_Prod;
GO

-- Create application user (least privilege)
CREATE LOGIN tanacargo_app WITH PASSWORD = 'SecurePassword123!';
GO

USE TanaCargo_Prod;
CREATE USER tanacargo_app FOR LOGIN tanacargo_app;
EXEC sp_addrolemember 'db_datareader', 'tanacargo_app';
EXEC sp_addrolemember 'db_datawriter', 'tanacargo_app';
GRANT EXECUTE ON SCHEMA::dbo TO tanacargo_app;
GO
```

### Docker Deployment

```yaml
version: '3.8'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_SERVER=sqlserver
      - DB_NAME=TanaCargo
    depends_on:
      - sqlserver

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  sqlserver_data:
```

### Production Checklist

- [ ] SQL Server configured with strong passwords
- [ ] Application user with least privilege
- [ ] Database backups configured
- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Rate limiting configured for production
- [ ] Logging and monitoring set up
- [ ] Health checks enabled

---

## Default Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tanacargo.com | Admin@123 |
| Seller | seller@tanacargo.com | User@123 |
| Customer | customer@tanacargo.com | User@123 |

**Note**: Change all passwords in production!

---

**Version**: 2.0.0 (SQL Server Edition)
**Last Updated**: 2026-01-21
**Author**: TanaCargo Development Team
