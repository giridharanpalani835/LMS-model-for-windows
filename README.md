# LMS-model

LMS-model is a full-stack Learning Management System built using React for the frontend and Node.js/Express with MongoDB for the backend.

## Features
- Student login and dashboard
- Teacher dashboard
- Admin dashboard
- Assignment and grade management
- Leaderboard
- Role-based access control
- REST API backend

## Tech Stack
- Frontend: React, React Router, Chart.js
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: JWT
- Styling: CSS

## Project Structure

```bash
LMS-model/
├── client/          # React frontend
├── server/          # Express backend
├── AFD.png
├── ERD.png
├── data flow 0.png
├── data flow 1.png
├── Directory structure
├── system architecture
├── README.md
```

## Prerequisites
- Node.js
- npm
- MongoDB

## Setup
### 1. Install frontend dependencies
```bash
cd client
npm install
```

### 2. Install backend dependencies
```bash
cd server
npm install
```

### 3. Configure environment variables
Create a `.env` file in the `server` folder and add:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
CLIENT_URL=http://localhost:3000
```

### 4. Run the app
Start backend:
```bash
cd server
npm start
```

Start frontend:
```bash
cd client
npm start
```

## Access
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## Roles
- Student
- Teacher
- Admin

## Notes
This project is designed for learning and academic/demo purposes and can be extended with more LMS features.
