# Library Seat Booking System

A comprehensive full-stack web application for managing library seat bookings with location-based attendance verification and device fingerprinting for enhanced security.

# Description

The Library Seat Booking System allows students to book and manage library seats in real-time.
It verifies user presence using GPS-based location tracking, ensures account authenticity via device fingerprinting, and automatically manages seat statuses (booked, free, on break).
The system aims to improve fairness and reduce misuse in institutional libraries while providing a modern, responsive user experience.

# Core Features
- **Real-Time Booking** – Instant seat availability updates
- **Location Verification** – GPS-based attendance confirmation (within 100m radius)
- **Device Fingerprinting** – Prevents multiple logins or spoofing
- **Automated Booking Expiry** – Cancels unconfirmed seats automatically
- **Break Mode** – Temporarily releases seats with auto-restoration
- **Responsive Frontend** – Built for both desktop and mobile

# Technical Stack
| Layer                 | Technologies                                                 |
| :-------------------- | :----------------------------------------------------------- |
| **Frontend**          | React.js, React Router, Axios, Tailwind CSS, CSS3            |
| **Backend**           | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, CORS  |
| **Utilities & Tools** | MongoDB Atlas, Postman, Git, GitHub |

# How to Run

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd library-seat-booking-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a .env file inside backend/:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
LIBRARY_LATITUDE=25.261071
LIBRARY_LONGITUDE=82.983812
ATTENDANCE_RADIUS_METERS=100
ATTENDANCE_CHECK_MINUTES=20
```

Run backend server:

```bash
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create .env in frontend/:

```bash
REACT_APP_API_URL=http://localhost:5000
```


Start frontend:

```bash
npm start
```

App runs on http://localhost:3000

### 4. (Optional) Seed the Database

If you want to initialize sample seats:

```bash
cd backend
npm run seed
```

**Frontend:** http://localhost:3000

**Backend API:** http://localhost:5000/api
