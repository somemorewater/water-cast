# WaterCast

WaterCast is a live-streaming platform built to explore real-time video and audio streaming on the web.  
It focuses on **low-latency live streams**, clean architecture, and a serious backend-first design.

This project is **live-only** (no recording) and intended as a learning and proof-of-concept platform.

---

## Features
- Live video & audio streaming
- One streamer → multiple viewers
- Low-latency playback using WebRTC
- Authenticated streamers
- Anonymous or guest viewers
- Real-time stream lifecycle handling

---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS, JavaScript (React optional)
- **Backend:** Node.js + Express
- **Real-time:** Socket.IO
- **Streaming:** WebRTC
- **Authentication:** JWT + bcrypt
- **Database:** MongoDB or PostgreSQL
- **STUN/TURN:** Google STUN (TURN optional)

---

## Project Structure

watercast/
│
├── client/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── js/
│ │ │ ├── auth.js
│ │ │ ├── streamer.js
│ │ │ ├── viewer.js
│ │ │ ├── webrtc.js
│ │ │ └── socket.js
│ │ ├── css/
│ │ │ └── styles.css
│ │ └── main.js
│ └── README.md
│
├── server/
│ ├── src/
│ │ ├── config/
│ │ │ ├── db.js
│ │ │ └── env.js
│ │ ├── controllers/
│ │ │ ├── auth.controller.js
│ │ │ └── stream.controller.js
│ │ ├── middleware/
│ │ │ ├── auth.middleware.js
│ │ │ └── rateLimit.js
│ │ ├── routes/
│ │ │ ├── auth.routes.js
│ │ │ └── stream.routes.js
│ │ ├── sockets/
│ │ │ └── signaling.socket.js
│ │ ├── models/
│ │ │ ├── user.model.js
│ │ │ └── stream.model.js
│ │ └── app.js
│ ├── server.js
│ └── README.md
│
├── .env.example
├── .gitignore
├── package.json
└── README.md


---

## Authentication
- Streamers must be authenticated
- Passwords are hashed using bcrypt
- JWT is used for session management
- Socket connections verify JWT on connect
- Stream ownership is enforced server-side

---

## Streaming Flow
1. User logs in
2. Streamer starts a stream
3. Browser captures camera/mic
4. WebRTC offer is created
5. Server relays signaling data
6. Viewers join using stream ID
7. ICE candidates exchanged
8. Stream plays in real time

---

## Limitations
- No video recording
- No SFU (poor scalability)
- Bandwidth usage increases per viewer
- Not production-ready

---

## Purpose
WaterCast exists to understand:
- WebRTC fundamentals
- Real-time signaling
- Auth + sockets integration
- Live streaming architecture
- Scaling limitations

---

## Future Improvements
- SFU integration (mediasoup / LiveKit)
- Stream recording
- Live chat & reactions
- Moderation tools
- Mobile apps
