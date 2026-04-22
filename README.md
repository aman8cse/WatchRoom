#  CoWatch — Watch Together, Feel Together

A real-time YouTube watch party application where multiple users can watch videos in perfect sync. Built with the MERN stack, Socket.IO for real-time communication, and the YouTube IFrame API.

**Live Demo:** `https://watchroom.aman8cse.live` 

##  Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- YouTube Data API v3 key (Google Cloud Console)

### 1. Clone the repository
```bash
git clone https://github.com/aman8cse/watchroom.git
cd watchroom
```
### 2. Setup the Server
```bash
cd server
npm install
```
Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cowatch
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

You should see:
```
MongoDB connected: cluster.mongodb.net
CoWatch running on port 5000
```
### 3. Setup the Client
```bash
cd client
npm install
```
Create `client/.env`:

```env
VITE_SERVER_URL=http://localhost:5000
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```
Start the client:
```bash
npm run dev
```
Visit `http://localhost:5173`


## Features

-  **JWT Authentication** — Register and login with secure token-based auth
-  **Room System** — Create rooms with unique codes or join via code
-  **YouTube Integration** — Search videos or paste YouTube URLs
-  **Real-time Sync** — Play, pause, and seek synced across all participants
-  **Role-based Access Control** — Host, Moderator, and Participant roles
-  **Live Chat** — Real-time messaging inside the room
-  **Emoji Reactions** — Floating reactions over the video player
-  **Participant Management** — Assign roles, remove users, transfer host
-  **Fully Responsive** — Works on mobile, tablet, and desktop

---

## Architecture

```
Client (React + Vite)
    │
    ├── HTTP (Axios)          → Express REST API  → MongoDB Atlas
    │   Auth, Room CRUD                             (permanent data)
    │
    └── WebSocket (Socket.IO) → Socket Server   → In-Memory Map
        Play, Pause, Seek,      (real-time)       (active rooms)
        Chat, Reactions              │
                                     └── Sync to MongoDB
                                         (on key events only)
```

**Why two layers?**
Real-time events (play/pause/seek) hit RAM directly for ~0ms latency. MongoDB is only written to on important events (room creation, video change) so late joiners can sync up.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI, routing, state management |
| Styling | Pure CSS + CSS Variables | Theming, responsive design |
| State | React Context + useState | Global auth and room state |
| HTTP Client | Axios | REST API calls with JWT interceptor |
| Real-time | Socket.IO Client | WebSocket connection to server |
| Backend | Node.js + Express | REST API, room logic |
| WebSockets | Socket.IO | Bidirectional real-time communication |
| Database | MongoDB + Mongoose | Users, room metadata persistence |
| Auth | JWT + bcryptjs | Secure token-based authentication |
| Video | YouTube IFrame API | Embedded controllable YouTube player |
| Search | YouTube Data API v3 | Search videos from frontend |

---

## 📁 Project Structure

```
CoWatch/
├── client/                          # React + Vite frontend
│   └── src/
│       ├── api/axios.js             # Axios instance + JWT interceptor
│       ├── components/              # VideoPlayer, Controls, Chat, etc.
│       ├── context/                 # AuthContext, RoomContext
│       ├── hooks/                   # useSocket, useRoom, usePlayer
│       ├── pages/                   # Landing, Login, Register, Dashboard, Room
│       ├── socket/socket.js         # Socket.IO client instance
│       ├── styles/                  # Global CSS + responsive breakpoints
│       └── utils/helpers.js         # Utility functions
│
└── server/                          # Node.js + Express backend
    ├── src/
    │   ├── classes/                 # OOP: Room, Participant, MessageHandler
    │   ├── config/db.js             # MongoDB connection
    │   ├── controllers/             # Auth and room controllers
    │   ├── middleware/auth.js       # JWT protect middleware
    │   ├── models/                  # User and Room Mongoose schemas
    │   ├── routes/                  # Auth and room routes
    │   ├── services/                # Business logic layer
    │   └── socket/socketManager.js  # Socket.IO initialization + auth
    ├── app.js                       # Express app
    └── server.js                    # Entry point
```

---

##  Role System

| Permission | Host | Moderator | Participant |
|-----------|------|-----------|-------------|
| Play / Pause / Seek | ✅ | ✅ | ❌ |
| Change Video | ✅ | ✅ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ |
| Remove Participants | ✅ | ❌ | ❌ |
| Transfer Host | ✅ | ❌ | ❌ |
| Chat + Reactions | ✅ | ✅ | ✅ |

> Role enforcement happens **on the backend**, not just the UI.

---

##  WebSocket Events

| Event | Direction | Permission | Payload |
|-------|-----------|-----------|---------|
| `join_room` | Client → Server | Anyone | `{ roomCode }` |
| `leave_room` | Client → Server | Anyone | `{ roomCode }` |
| `play` | Client → Server | Host, Mod | `{ roomCode }` |
| `pause` | Client → Server | Host, Mod | `{ roomCode }` |
| `seek` | Client → Server | Host, Mod | `{ roomCode, time }` |
| `change_video` | Client → Server | Host, Mod | `{ roomCode, videoId }` |
| `assign_role` | Client → Server | Host only | `{ roomCode, userId, role }` |
| `remove_participant` | Client → Server | Host only | `{ roomCode, userId }` |
| `transfer_host` | Client → Server | Host only | `{ roomCode, userId }` |
| `send_message` | Client → Server | Anyone | `{ roomCode, message }` |
| `send_reaction` | Client → Server | Anyone | `{ roomCode, emoji }` |
| `sync_state` | Server → Client | Server | `{ videoState, participants, messages }` |
| `user_joined` | Server → Room | Server | `{ user, participants }` |
| `user_left` | Server → Room | Server | `{ userId, participants }` |
| `role_assigned` | Server → Room | Server | `{ userId, role, participants }` |
| `new_message` | Server → Room | Server | `{ userId, username, message, timestamp }` |
| `new_reaction` | Server → Room | Server | `{ userId, username, emoji }` |

---

## 🌐 REST API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| POST | `/api/rooms` | ✅ | Create a new room |
| GET | `/api/rooms/:code` | ✅ | Get room by code |
| GET | `/api/rooms/:code/exists` | ✅ | Check if room exists |

---

##  Key Design Decisions

**In-memory + MongoDB hybrid**
Active room state lives in RAM for instant access. MongoDB is only written to on key events (room creation, video change) so late joiners can sync up. This avoids hitting the database on every play/pause/seek.

**OOP WebSocket server**
The socket layer uses `Room`, `Participant`, and `MessageHandler` classes to encapsulate state and logic cleanly. This makes it easy to extend and test.

**Service layer**
Business logic is separated into `services/` so it can be reused by both REST controllers and socket handlers without duplication.

**Role enforcement on backend**
All permission checks happen server-side in the `Participant` class. Frontend only hides controls for UX — the backend is the source of truth.

---

##  Author

**Aman Agrahari**
- GitHub: [@aman8cse](https://github.com/aman8cse)
- LinkedIn: [linkedin.com/in/aman-agrahari-a36357308/]