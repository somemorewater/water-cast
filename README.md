# WaterCast

WaterCast is a live streaming platform built to explore real-time video and audio on the web.  
It focuses on low-latency streams, a clean Node.js backend, and WebRTC signaling.

This project is live-only (no recording) and intended as a learning project.

## Features
- Live video and audio streaming
- One streamer to multiple viewers
- Low-latency playback using WebRTC
- Authenticated streamers (JWT)
- Guest viewers
- Stream lifecycle + viewer counts
- Realtime chat over Socket.IO

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Realtime: Socket.IO
- Streaming: WebRTC
- Authentication: JWT + bcrypt
- Database: MongoDB
- STUN: Google STUN

## Project Structure

```
WaterCast/
├── public/
│   ├── *.html
│   ├── js/
│   └── style.css
├── server/
│   ├── src/
│   ├── server.js
│   └── README.md
└── README.md
```

## Local Setup
1. Create `server/.env` from `server/.env.example`.
2. Install dependencies:

```bash
cd server
npm install
```

3. Start the backend:

```bash
npm run dev
```

The backend serves the frontend from `public/` and runs at `http://localhost:5000`.

## Core API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/streams` (auth)
- `POST /api/streams/:id/end` (auth)
- `GET /api/streams/live`
- `GET /api/streams/:id`

## Streaming Flow
1. User logs in
2. Streamer starts a stream
3. Browser captures camera and mic
4. WebRTC offer is created
5. Server relays signaling data
6. Viewers join using stream ID
7. ICE candidates exchanged
8. Stream plays in real time

## Limitations
- No recording
- No SFU (bandwidth scales per viewer)
- Not production ready

## Future Improvements
- SFU integration (mediasoup / LiveKit)
- Stream recording
- Moderation tools
