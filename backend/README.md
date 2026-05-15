# JSON Viewer — Backend

Node.js + Express + Socket.io + Yjs real-time collaboration backend.

## Ishga tushirish

```bash
# 1. Dependencylarni o'rnatish
npm install

# 2. Dev rejimda ishga tushirish
npm run dev

# 3. Production build
npm run build && npm start
```

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /health | Server holati |
| POST | /api/json/validate | JSON validate |
| POST | /api/json/format | JSON format (pretty) |
| POST | /api/json/minify | JSON minify |
| POST | /api/json/analyze | JSON tahlil |
| POST | /api/rooms/create | Yangi room |
| GET | /api/rooms/:id | Room info |
| GET | /api/rooms/:id/clients | Room clients |

## Socket.io Events

### Client → Server
- `room:create` → yangi room yaratish
- `room:join(roomId)` → roomga kirish
- `room:leave` → roomdan chiqish
- `sync:update(update)` → Yjs update yuborish
- `sync:request-state` → initial state so'rash
- `awareness:update(update)` → cursor/presence update
- `cursor:update(cursor)` → cursor position

### Server → Client
- `room:joined` → room joined notification
- `room:left` → kimdir chiqdi
- `room:error` → xato
- `sync:state(state)` → initial Yjs state
- `sync:update(update)` → Yjs update
- `awareness:update(update)` → presence update
- `cursor:update` → cursor position
- `server:stats` → server statistika

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server porti |
| CORS_ORIGIN | http://localhost:3000 | Frontend URL |
| MAX_JSON_SIZE_MB | 10 | Max JSON hajmi |
| MAX_ROOMS | 1000 | Max room soni |
| MAX_CLIENTS_PER_ROOM | 100 | Har bir roomda max client |
| ROOM_IDLE_TIMEOUT_MS | 3600000 | Bo'sh room timeout (1 soat) |
