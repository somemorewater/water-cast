# WaterCast Project Documentation

This document describes the WaterCast codebase as it exists in this repository. It covers architecture, runtime flows, backend and frontend modules, and the API and Socket.IO contracts implemented in code.

## Project Overview
WaterCast is a live streaming platform focused on low-latency WebRTC streaming with a Node.js/Express backend, Socket.IO signaling, MongoDB persistence, and Redis-backed viewer tracking. The frontend is a static HTML/CSS/JS app served by the backend.

## High-Level Architecture
- **Frontend**: Static HTML pages in `public/` with JavaScript for auth, streaming, dashboard stats, and watch interactions.
- **Backend**: Express app in `server/src` with REST APIs for auth, streams, users, and settings.
- **Realtime**: Socket.IO signaling server for WebRTC offers/answers/ICE and chat.
- **Data**: MongoDB via Mongoose for users and streams.
- **Viewer counts**: Redis sets for per-stream viewer tracking.

## Repository Structure
```
WaterCast/
|-- public/                 # Static frontend
|   |-- *.html              # Page templates
|   |-- js/                 # Page scripts and shared utilities
|   |-- img/                # Branding assets
|   |-- src/input.css       # Tailwind input
|   |-- src/output.css      # Tailwind build output
|   `-- style.css           # Additional styles
|-- server/                 # Node.js backend
|   |-- server.js           # HTTP + Socket.IO server entry
|   |-- src/                # Express app + domain logic
|   `-- .env.example        # Environment template
|-- docker-compose.yml      # Redis service for viewer tracking
`-- README.md               # Project overview
```

## Setup and Running
### Backend
1. Create `server/.env` based on `server/.env.example`.
2. Install dependencies:
```bash
cd server
npm install
```
3. Start the server:
```bash
npm run dev
```

The backend serves the frontend from `public/` and runs at `http://localhost:5000` by default.

### Redis (Viewer Tracking)
The server uses Redis for viewer count tracking. A ready-to-run Redis container is defined in `docker-compose.yml`.
```bash
docker compose up -d
```

## Environment Variables
Defined in `server/src/config/env.js` and `server/.env.example`:
- `PORT` (default `5000`)
- `MONGODB_URI` (default `mongodb://localhost:27017/watercast`)
- `JWT_SECRET` (default `dev_secret_change_me`)
- `JWT_EXPIRES_IN` (default `7d`)
- `CLIENT_ORIGIN` (default `*`)
- `REDIS_URL` (default `redis://localhost:6379`)

## Backend Details

### Entry Point
- `server/server.js`
  - Creates an HTTP server from the Express app.
  - Initializes Socket.IO signaling (`initSockets`).
  - Connects to MongoDB and starts listening on `env.PORT`.

### Express App
- `server/src/app.js`
  - Configures CORS using `CLIENT_ORIGIN`.
  - Parses JSON requests.
  - Serves static files from `public/`.
  - Registers API routes under `/api/*`.
  - Uses `notFound` and `errorHandler` middleware.

### Middleware
- `server/src/middleware/auth.middleware.js`
  - `requireAuth`: verifies Bearer JWT and sets `req.user`.
  - `optionalAuth`: sets `req.user` when token exists, ignores invalid tokens.
- `server/src/middleware/error.middleware.js`
  - `notFound`: 404 handler.
  - `errorHandler`: normalizes error responses and handles Mongo errors.

### Models
- `server/src/models/user.model.js`
  - User fields: `username`, `email`, `passwordHash`, `displayName`, `handle`, `bio`.
  - Settings: `streamDefaults`, `notifications`, `privacy`.
  - Followers: array of user ids.
- `server/src/models/stream.model.js`
  - Stream fields: `title`, `description`, `category`, `quality`, `enableChat`.
  - Lifecycle: `status`, `streamKey`, `streamer`, `startedAt`, `endedAt`.
  - Viewer count stored in `viewerCount`.

### Services
- `server/src/services/auth.service.js`
  - `signupUser`: validates input, hashes password, creates user, returns JWT + profile.
  - `loginUser`: validates credentials, returns JWT + profile.
  - `getCurrentUser`: returns `req.user` from JWT.
- `server/src/services/stream.service.js`
  - `createStreamService`: validates title, ends previous live streams for the user, creates a new live stream with a `streamKey`.
  - `endStreamService`: sets stream status to offline and resets viewer count.
- `server/src/services/viewer.service.js`
  - `addViewer`: uses Redis sets to track sockets and unique viewers per stream.
  - `removeViewerBySocket`: removes a viewer socket and updates per-stream counts.
  - `clearViewers`: clears all viewer sets for a stream.

### Controllers
- `server/src/controllers/auth.controller.js`
  - `signup`, `login`, `me` wrappers around auth service.
- `server/src/controllers/stream.controller.js`
  - `listLiveStreams`: returns all live streams with streamer username.
  - `getStream`: returns a single stream by id.
  - `createStream`: creates a new live stream (auth required).
  - `endStream`: ends a live stream (auth required).
- `server/src/controllers/settings.controller.js`
  - `getSettings`: returns profile + settings for current user.
  - `updateSettings`: updates profile and nested settings objects.
- `server/src/controllers/user.controller.js`
  - `getUserProfile`: returns public profile + follow state.
  - `toggleFollow`: follow/unfollow another user.

### Routes
- `server/src/routes/auth.routes.js`
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (auth)
- `server/src/routes/stream.routes.js`
  - `GET /api/streams/live`
  - `GET /api/streams/:id`
  - `POST /api/streams` (auth)
  - `POST /api/streams/:id/end` (auth)
- `server/src/routes/settings.routes.js`
  - `GET /api/settings` (auth)
  - `PUT /api/settings` (auth)
- `server/src/routes/user.routes.js`
  - `GET /api/users/:id` (optional auth)
  - `POST /api/users/:id/follow` (auth)

### Socket.IO Signaling
- `server/src/sockets/signaling.socket.js`
  - Maintains an in-memory room map of `streamId -> broadcasterId`.
  - Handles broadcaster and watcher join/leave.
  - Relays WebRTC offers/answers/ICE.
  - Emits `viewer-count` updates to stream rooms.
  - Broadcasts chat messages.
  - Ends streams on broadcaster disconnect or `end-stream` event.

## API Reference

### Auth
- `POST /api/auth/signup`
  - Body: `{ username, email, password }`
  - Response: `{ token, user: { id, username, email } }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, username, email } }`
- `GET /api/auth/me` (auth)
  - Response: `{ user: { id, email, username } }`

### Streams
- `GET /api/streams/live`
  - Response: `{ streams: [ { id, title, description, category, quality, enableChat, status, viewerCount, startedAt, streamer } ] }`
- `GET /api/streams/:id`
  - Response: `{ stream: { id, title, description, category, quality, enableChat, status, viewerCount, startedAt, endedAt, streamer } }`
- `POST /api/streams` (auth)
  - Body: `{ title, description, category, quality, enableChat }`
  - Response: `{ stream: { id, title, description, category, quality, enableChat, status, streamer, startedAt, streamKey } }`
- `POST /api/streams/:id/end` (auth)
  - Response: `{ message: "Stream ended" }`

### Settings
- `GET /api/settings` (auth)
  - Response: `{ user: { id, username, email, displayName, handle, bio }, settings }`
- `PUT /api/settings` (auth)
  - Body: `{ displayName, handle, bio, settings }`
  - Response: `{ message: "Settings updated" }`

### Users
- `GET /api/users/:id` (optional auth)
  - Response: `{ user: { id, username, displayName, handle, bio, followerCount, isFollowing } }`
- `POST /api/users/:id/follow` (auth)
  - Response: `{ following, followerCount }`

## Socket.IO Events

### Client -> Server
- `broadcaster-join` `{ streamId }`
- `watcher-join` `{ streamId, name }`
- `offer` `{ watcherId, sdp }`
- `answer` `{ broadcasterId, sdp }`
- `ice-candidate` `{ to, candidate }`
- `chat-message` `{ streamId, message, user }`
- `end-stream` `{ streamId }`

### Server -> Client
- `offer` `{ broadcasterId, sdp }`
- `answer` `{ watcherId, sdp }`
- `ice-candidate` `{ from, candidate }`
- `viewer-count` `{ count }`
- `chat-message` `{ user, message, system }`
- `stream-ended`
- `stream-status` `{ status }`
- `watcher-joined` `{ watcherId }`
- `watcher-left` `{ watcherId }`

## Frontend Details

### Shared Utilities
- `public/js/api.js`
  - Defines `window.WatercastApi` with `fetchJson`, `getToken`, `setToken`, `clearToken`.
  - Adds `Authorization: Bearer <token>` automatically when present.
- `public/js/ui.js`
  - Defines `window.WatercastUI` with modal alerts, confirmations, toasts, and button loading state.

### Pages and Scripts
- `public/index.html`
  - Landing page and live stream grid.
  - Script: `public/js/home.js` loads `/api/streams/live` and renders cards.
- `public/login.html` and `public/signup.html`
  - Script: `public/js/auth.js` handles login/signup, stores token, redirects to `index.html`.
- `public/dashboard.html`
  - Script: `public/js/dashboard.js` shows live stream stats, viewer totals, and activity using `/api/streams/live` and `/api/auth/me`.
- `public/go-live.html`
  - Script: `public/js/go-live.js` handles camera capture, stream creation, WebRTC broadcast, stream timer, and end stream cleanup.
- `public/watch.html`
  - Script: `public/js/watch.js` joins a stream, negotiates WebRTC, listens for chat and viewer updates, and handles follow actions.
- `public/settings.html`
  - Script: `public/js/settings.js` loads and saves profile/settings via `/api/settings`.
- `public/schedule.html`
  - Script: `public/js/schedule.js` displays an empty state (no scheduling backend exists).
- `public/notifications.html`
  - Static page with empty states for notifications.
- `public/js/mobile-menu.js`
  - Shared mobile menu open/close logic.
- `public/js/slider.js`
  - Swiper slider setup for the landing page hero.
- `public/js/twitter.js`
  - Extra mobile interaction helpers (not wired into core flows).

### Styling
- `public/src/input.css` uses Tailwind directives.
- `public/src/output.css` contains the compiled Tailwind CSS.
- `public/style.css` adds additional page styling.

## Core Runtime Flows

### Login
1. User submits login form.
2. `auth.js` calls `POST /api/auth/login`.
3. JWT token is stored in localStorage and used by `WatercastApi`.

### Start Streaming
1. User opens `go-live.html` and clicks \"Go Live\".
2. Browser captures camera and mic via `getUserMedia`.
3. `POST /api/streams` creates a live stream and returns `streamId` + `streamKey`.
4. Socket.IO emits `broadcaster-join`.
5. Viewer connections trigger `offer`/`answer` and `ice-candidate` exchanges.

### Watch Stream
1. Viewer navigates to `watch.html?streamId=...`.
2. Socket.IO emits `watcher-join`.
3. Server relays `offer`, viewer replies with `answer`.
4. Media plays in `<video id="remoteVideo">`.

### Chat
- Viewer chat messages are sent via `chat-message` and broadcast to the stream room.

### End Stream
- Stream ends on broadcaster action or disconnect.
- Server emits `stream-ended` and sets stream status to offline.

## Known Limitations
- No recording or VOD support.
- No SFU (each viewer is a separate WebRTC connection).
- Not production hardened.

## Suggested Next Steps
- Add a build script for Tailwind CSS in `public/package.json`.
- Add a page or API for scheduling streams.
- Add TURN servers for better NAT traversal.
- Add persistence for chat history.
