# ♻️ e-Collect Go

## 📖 Overview

e-Collect Go makes e-waste disposal effortless and rewarding. Users log their electronic items (phones, laptops, batteries, appliances), schedule home pickups, earn eco-points for recycling, and track their environmental impact. Admins manage the full pickup lifecycle and monitor platform analytics from a dedicated dashboard.


## ✨ Features

### For Citizens
- **E-waste Logging** — Log items by category (Laptop, Mobile, TV, Battery, etc.) with condition, brand, and quantity
- **Pickup Scheduling** — Book home pickups with address, date, and time slot (Morning / Afternoon / Evening)
- **Eco Points & Levels** — Earn points per recycled item; progress from *Beginner* → *Eco Starter* → *Eco Warrior* → *Eco Guardian* → *Eco Champion*
- **CO₂ Savings Tracker** — See your personal environmental impact in kg CO₂ saved
- **Recycling Center Map** — Discover nearby drop-off centers filtered by city
- **Leaderboard** — Compete with other users on eco-points
- **Profile Management** — Edit name, city, and phone number

### For Administrators
- **All Pickups View** — See every pickup request across the platform with filters
- **Pickup Lifecycle** — Approve, reject, or mark pickups as completed; attach admin notes
- **Analytics Dashboard** — Overview of total pickups, CO₂ saved, items recycled, and pending requests
- **User Management** — View all users and toggle account active/inactive status
- **Waste Item Oversight** — Review all logged waste items platform-wide

---

## 🏗️ Architecture

ecollect-go/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios API client (index.js)
│       ├── components/      # Shared UI (Navbar, Spinner, StatusBadge, ConfirmModal, EmptyState)
│       ├── context/         # AuthContext — JWT state + user session
│       └── pages/           # Home, Login, Register, Dashboard, WastePage,
│                            #   PickupPage, MapPage, AdminPage, NotFound
│
└── server/                  # Node.js + Express backend
    ├── config/
    │   └── db.js            # MongoDB connection via Mongoose
    ├── controllers/         # Business logic per domain
    │   ├── authController.js
    │   ├── userController.js
    │   ├── wasteController.js
    │   ├── pickupController.js
    │   └── centerController.js
    ├── middleware/
    │   ├── auth.js          # JWT guard (protect) + role gate (adminOnly)
    │   └── errorHandler.js  # Global error handler
    ├── models/              # Mongoose schemas
    │   ├── User.js
    │   ├── WasteItem.js
    │   ├── Pickup.js
    │   └── Center.js
    ├── routes/              # Express routers
    │   ├── auth.js
    │   ├── users.js
    │   ├── waste.js
    │   ├── pickups.js
    │   └── centers.js
    ├── seed/
    │   └── seed.js          # Sample data seeder
    ├── utils/
    │   └── token.js         # JWT sign / verify helpers
    └── server.js            # App entry point

### Data Models

| Model | Key Fields |
|---|---|
| **User** | name, email, password (bcrypt), city, role (user/admin), points, totalItemsRecycled, co2Saved, level, isActive |
| **WasteItem** | user, category, itemName, brand, condition, quantity, pointsEarned, co2Saved, status (logged → pickup_requested → collected → recycled), pickup |
| **Pickup** | user, items[], address, city, scheduledDate, timeSlot, status (pending → approved/rejected → completed), adminNote, pointsAwarded |
| **Center** | name, address, city, coordinates {lat, lng}, accepts[], hours, rating, capacity, isActive |

### API Endpoints

| Prefix | Routes | Auth |
|---|---|---|
| `POST /api/auth/register` | Register new user | Public |
| `POST /api/auth/login` | Login + receive JWT | Public |
| `GET /api/auth/me` | Get current user | JWT |
| `GET /api/users/profile` | Fetch own profile | JWT |
| `PUT /api/users/profile` | Update profile | JWT |
| `GET /api/users/leaderboard` | Points leaderboard | JWT |
| `GET /api/users/admin/all` | All users | Admin |
| `PUT /api/users/admin/:id/toggle` | Activate/deactivate user | Admin |
| `GET /api/waste/categories` | List waste categories | Public |
| `POST /api/waste` | Log a waste item | JWT |
| `GET /api/waste/my` | My logged items | JWT |
| `DELETE /api/waste/:id` | Delete waste item | JWT |
| `GET /api/waste/admin/all` | All items | Admin |
| `POST /api/pickups` | Schedule pickup | JWT |
| `GET /api/pickups/my` | My pickups | JWT |
| `DELETE /api/pickups/:id` | Cancel pickup | JWT |
| `GET /api/pickups/admin/all` | All pickups | Admin |
| `GET /api/pickups/admin/analytics` | Platform analytics | Admin |
| `PUT /api/pickups/admin/:id/approve` | Approve pickup | Admin |
| `PUT /api/pickups/admin/:id/reject` | Reject pickup | Admin |
| `PUT /api/pickups/admin/:id/complete` | Mark complete + award points | Admin |
| `GET /api/centers` | Centers by city | Public |

### Gamification System

Points are awarded per category when a pickup is marked **completed**:

| Category | Points | CO₂ Saved |
|---|---|---|
| Refrigerator | 300 | 5.0 kg |
| Washing Machine | 250 | 4.0 kg |
| TV / Monitor | 200 | 3.0 kg |
| Laptop / PC | 150 | 1.2 kg |
| Printer | 120 | 1.0 kg |
| Tablet | 100 | 0.9 kg |
| Mobile Phone | 80 | 0.7 kg |
| Battery | 30 | 0.3 kg |
| Charger / Cable | 20 | 0.1 kg |
| Other Electronics | 50 | 0.5 kg |

User levels update automatically based on cumulative points:

```
0      → Beginner
200    → Eco Starter
800    → Eco Warrior
2,000  → Eco Guardian
5,000  → Eco Champion
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/sumanssringeri94-create/ecollect-go.git
cd ecollect-go
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env   # or create .env manually
```

Required environment variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecollect-go
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

Install dependencies and start:

```bash
npm install
npm run dev         # starts with nodemon on :5000
```

Seed sample recycling centers:

```bash
npm run seed
```

### 3. Configure the frontend

```bash
cd ../client
npm install
npm run dev         # starts Vite dev server on :5173
```

### 4. Open the app

Navigate to https://ecollect-go.vercel.app/

---

## 🌐 Deployment

| Layer | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) (`client/vercel.json` included) |
| Backend | Any Node.js host (Render, Railway, Fly.io) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |

The frontend is configured to proxy `/api` requests to the backend via `vite.config.js`. In production, set the API base URL as an environment variable.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite, Tailwind CSS, Axios, react-hot-toast, Lucide React |
| Backend | Node.js, Express 4, Mongoose 7, JWT (jsonwebtoken), bcryptjs, express-validator, Morgan |
| Database | MongoDB |
| Auth | JWT Bearer tokens, bcrypt password hashing (salt rounds: 12) |

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 salt rounds) before storage
- All sensitive routes protected by the `protect` middleware (JWT verification)
- Admin-only routes gated behind the `adminOnly` middleware (role check)
- CORS restricted to known origins (localhost and Vercel deployment)
- Passwords excluded from all query results via Mongoose `select: false`

---

## 📄 License

MIT
