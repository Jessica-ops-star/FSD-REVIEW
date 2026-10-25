# Integrated Restaurant Management and Ordering Platform (MERN Stack)

> **Full-Stack MERN Academic Project — Integrated Central Restaurant Operations & Real-Time Ordering System**

---

## 📌 Executive Summary & Architecture

**Spice Garden Central** is an integrated, end-to-end Restaurant Management and Ordering Platform built exclusively with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

Unlike public marketplace aggregates (Swiggy, Zomato), this platform unifies an entire restaurant's operational lifecycle into a **single source of truth** in MongoDB with authenticated real-time WebSocket communication via Socket.IO.

```
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│ CUSTOMER PORTAL │ ────> │  CENTRAL EXPRESS /     │ <───> │ RESTAURANT ADMIN     │
│ (Browse, Cart,  │       │  NODE.JS REST API      │       │ (Menu, Staff, Orders,│
│  Simulated Pay, │       │   + SOCKET.IO SYNC     │       │  Dispatches, Revenue)│
│  Live Tracking) │       └───────────┬────────────┘       └──────────────────────┘
└─────────────────┘                   │
                                      ▼
                       ┌──────────────────────────────┐
                       │       MONGODB DATABASE       │
                       │  (Idempotent Seed, Mongoose) │
                       └──────────────┬───────────────┘
                                      │
         ┌────────────────────────────┴───────────────────────────┐
         ▼                                                        ▼
┌─────────────────────────┐                            ┌────────────────────────┐
│  KITCHEN DISPLAY SYSTEM │                            │ DELIVERY DISPATCH      │
│  (KDS: Accept -> Cook   │                            │ (Pick Up -> In Transit │
│   -> Mark Ready)        │                            │  -> Deliver to Door)   │
└─────────────────────────┘                            └────────────────────────┘
```

---

## 🛠️ Mandatory Technology Stack

- **Database**: MongoDB with Mongoose ODM (models, validations, indexes, references)
- **Backend**: Node.js & Express.js REST API with Socket.IO WebSocket server
- **Frontend**: React 18 with Vite, React Router v6, Axios, Lucide React icons
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **Styling**: Vanilla CSS & Tailwind CSS utility classes preserved from existing template
- **Zero-Config Database**: Seamlessly auto-connects to local MongoDB (`mongodb://127.0.0.1:27017/restaurant_platform`), with automatic fallback to `mongodb-memory-server` and automated seeding on startup.

---

## 👥 Four Distinct User Roles & Permissions

The application supports 4 distinct user roles, with dedicated registration flows, role-specific portals, dashboards, and navigation:

| Role | Portal / Dashboard | Permissions & Primary Features |
| :--- | :--- | :--- |
| **CUSTOMER** | `/menu`, `/customer/orders`, `/customer/orders/:id` | Public registration, browse dishes, real-time search & debounced filters, cart persistence, simulated payment (UPI, Card, Cash on Delivery), order placement, 7-stage live tracking timeline. |
| **RESTAURANT_ADMIN** | `/admin/dashboard`, `/admin/menu`, `/admin/staff`, `/admin/orders`, `/admin/payments`, `/admin/deliveries` | Master restaurant oversight, menu management (add, edit, delete, toggle availability), category management (CRUD), staff provisioning & deactivation, delivery assignment, transaction auditing. |
| **KITCHEN_STAFF** | `/kitchen/dashboard` | Live Kitchen Display System (KDS), queue monitoring, customer special instructions, state transitions: `PLACED` → `CONFIRMED` → `PREPARING` → `READY`. |
| **DELIVERY_PERSONNEL** | `/delivery/dashboard` | Dispatch board, customer address & phone contact, order pickup & doorstep handoff: `READY` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`. |

### Security Requirements for Role Registration

To prevent unauthorized privilege escalation, the backend strictly validates registrations:
- **Customer Registration**: Public (no passcodes required).
- **Restaurant Admin Registration**: Requires the authorized Setup Passcode: `ADMIN2026`.
- **Kitchen Staff Registration**: Requires the authorized Kitchen Invitation Code: `KITCHEN2026`.
- **Delivery Personnel Registration**: Requires the authorized Delivery Invitation Code: `DELIVERY2026`.

Admins can also provision staff accounts directly from `/admin/staff` and toggle active/suspended status or reset passwords.

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-seeded with 4 active accounts (or accessible via the 1-Click Demo Login bar at `/login`):

| Role | Email Address | Password | Security Key / Invite Code |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@restaurant.com` | `Customer@123` | *(None / Public)* |
| **Restaurant Admin** | `admin@restaurant.com` | `Admin@123` | `ADMIN2026` |
| **Kitchen Staff** | `kitchen@restaurant.com` | `Kitchen@123` | `KITCHEN2026` |
| **Delivery Personnel** | `delivery@restaurant.com` | `Delivery@123` | `DELIVERY2026` |

---

## 🍲 Pre-Populated Food Menu & Categories

The database includes 1 restaurant (`Spice Garden Restaurant`), **7 categories**, and **32 realistic food items** with INR (`₹`) prices, descriptions, and high-quality photographs:

### 1. Categories
1. **Starters** (Paneer Tikka, Chicken 65, Gobi Manchurian, Samosa, French Fries)
2. **South Indian** (Masala Dosa, Plain Dosa, Idli, Poori, Parotta)
3. **Main Course** (Paneer Butter Masala, Butter Chicken, Pasta, Margherita Pizza, Veg Burger, Chicken Burger)
4. **Rice and Biryani** (Chicken Biryani, Veg Biryani, Paneer Biryani, Chicken Fried Rice, Veg Fried Rice)
5. **Chinese** (Chicken Noodles, Veg Noodles)
6. **Desserts** (Gulab Jamun, Brownie with Ice Cream, Vanilla Ice Cream, Rasgulla, Kheer)
7. **Beverages** (Mango Lassi, Fresh Lime Soda, Cold Coffee, Masala Tea)

---

## 🔄 7-Stage Order Lifecycle Workflow

Every order placed by a customer flows through 7 synchronized lifecycle states:

```
[PLACED]           Customer checks out via UPI, Card, or COD.
   ↓
[CONFIRMED]        Kitchen Staff accepts the incoming order.
   ↓
[PREPARING]        Kitchen Staff starts food cooking in KDS.
   ↓
[READY]            Kitchen Staff marks the dish packed and ready for pickup.
   ↓
[PICKED_UP]        Admin assigns delivery personnel, or rider claims order and marks Picked Up.
   ↓
[OUT_FOR_DELIVERY] Delivery Personnel departs restaurant and heads towards customer address.
   ↓
[DELIVERED]        Delivery Personnel completes doorstep delivery; payment finalized.
```

### Real-Time Socket.IO Synchronization

The backend broadcasts event updates upon state changes:
- `order:created` → Sent to Kitchen and Admin rooms
- `order:confirmed` → Sent to Customer and Admin
- `order:preparing` → Sent to Customer and Admin
- `order:ready` → Sent to Customer, Admin, and Delivery Personnel rooms
- `delivery:assigned` → Sent to the specific assigned driver and Customer
- `delivery:picked_up` → Sent to Customer and Admin
- `delivery:out_for_delivery` → Sent to Customer and Admin
- `order:delivered` → Sent to Customer and Admin
- `menu:updated` → Broadcasts live price, availability, and item additions

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
- **Node.js**: v18+ 
- **npm**: v9+
- Optional: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (if not running, the backend automatically spins up an in-memory database fallback).

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # Seeds 1 restaurant, 7 categories, 32 dishes, 4 demo users idempotently
npm run dev      # Starts server on http://localhost:5000 with Socket.IO
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5173
```

---

## 🧪 Testing Verification & Execution

### 1. Automated Integration Test Suite
To run the automated 26-step end-to-end test suite:
```bash
node scratch/test_suite.js
```
The script validates:
- Health check & API routes
- Seeded categories (7) and menu items (32)
- Case-insensitive search (`biryani`, `paneer`)
- Authentication for all 4 roles
- Privilege escalation prevention (unauthorized Admin registration blocked)
- Cart persistence & server-side quantity/tax calculation
- Complete 7-stage order lifecycle from `PLACED` through `DELIVERED`
- Admin Menu CRUD, price modification, availability toggle, and cart block on unavailable dishes
- Staff account provisioning

### 2. Manual 36-Step Walkthrough Flow
1. Open `http://localhost:5173/login` and click **"Customer Demo (1-Click)"**.
2. Go to **Browse Menu**, search for `"biryani"`, and observe filtered results.
3. Filter by category (e.g., *Rice and Biryani* or *Desserts*).
4. Click **View Details** on *Chicken Biryani* to inspect the modal and price in `₹`.
5. Add *Chicken Biryani* and *Cold Coffee* to the cart.
6. Open the **Cart Drawer**, adjust quantities, verify subtotal + 5% GST + delivery fee.
7. Proceed to checkout, enter the delivery address, and select simulated **UPI** payment.
8. Place order and verify redirect to **Live Order Tracker (`/customer/orders/:id`)**.
9. Sign out and log in as **Kitchen Staff** (`kitchen@restaurant.com` / `Kitchen@123`).
10. In the KDS, click **Accept Order** (`CONFIRMED`) → **Start Preparing** (`PREPARING`) → **Mark Ready** (`READY`).
11. Sign out and log in as **Restaurant Admin** (`admin@restaurant.com` / `Admin@123`).
12. Go to **All Orders**, click **Assign Rider**, select *Deepak Delivery*, and confirm assignment.
13. Sign out and log in as **Delivery Personnel** (`delivery@restaurant.com` / `Delivery@123`).
14. Go to the Dispatch portal, click **Mark Picked Up from Kitchen** (`PICKED_UP`).
15. Click **Mark Out for Delivery** (`OUT_FOR_DELIVERY`).
16. Click **Mark Delivered to Customer** (`DELIVERED`).
17. Log back in as **Customer**: verify that Order History and Order Tracking display the completed order.
18. Log in as **Admin**, navigate to **Menu Management**:
    - Edit a dish price, toggle availability to *Unavailable*, and verify it cannot be added to cart.
    - Click **Category Management** to add, edit, or delete categories.
    - Navigate to **Staff Management** (`/admin/staff`) to provision or deactivate staff accounts.

---

## 📊 Summary of Implementation

1. **What was implemented**:
   - Complete MERN stack backend with 8 Mongoose models: `User`, `Restaurant`, `Category`, `MenuItem`, `Cart`, `Order`, `Payment`, `Delivery`.
   - 4 distinct roles (`CUSTOMER`, `RESTAURANT_ADMIN`, `KITCHEN_STAFF`, `DELIVERY_PERSONNEL`) with role normalization and route guards.
   - Dedicated role-based registration cards with authorized setup & invite codes (`ADMIN2026`, `KITCHEN2026`, `DELIVERY2026`).
   - Repeatable seed script populating 1 restaurant, 7 categories, 32 dishes, and 4 accounts with zero duplicates.
   - Debounced search, category filters, availability toggles, price and alphabetical sorting, dish details modal.
   - Server-side shopping cart with GST, delivery charges, and simulated UPI/Card/COD payments.
   - Complete 7-stage order lifecycle: `PLACED` → `CONFIRMED` → `PREPARING` → `READY` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`.
   - Real-time Socket.IO synchronization on order status updates and menu changes.
   - Full Admin Menu Management, Category Management, and Staff Management (`/admin/staff`).

2. **What was tested successfully**:
   - Automated 26-step API integration test suite (`scratch/test_suite.js`) executing with 100% pass rate.
   - Production Vite frontend build (`tsc && vite build`) passing with zero errors.
   - Backend TypeScript build (`tsc`) passing with zero errors.
   - Live development servers running synchronously on ports 5000 and 5173.

3. **What still requires configuration**:
   - None for standard execution! The project includes automatic MongoDB memory fallback, pre-configured seed data, and demo accounts out-of-the-box.
   - For remote production deployment, set `MONGODB_URI` and `JWT_SECRET` in `server/.env`.

4. **Any remaining limitations**:
   - Payments are simulated (academic prototype) and do not connect to live banking gateways.
   - Real GPS vehicle tracking hardware is not integrated; tracking operates on accurate status-based lifecycle progression.
