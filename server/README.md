# WaterCast Server

## Setup
1. Create `server/.env` using `server/.env.example` as a template.
2. Install dependencies:

```bash
cd server
npm install
```

3. Start the server:

```bash
npm run dev
```

The server will run on `http://localhost:5000` by default and serves the `public/` frontend.

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/streams` (auth)
- `POST /api/streams/:id/end` (auth)
- `GET /api/streams/live`
- `GET /api/streams/:id`

## WebRTC Signaling (Socket.IO)
Events:
- `broadcaster-join`
- `watcher-join`
- `offer`, `answer`, `ice-candidate`
- `chat-message`
- `viewer-count`, `stream-ended`
