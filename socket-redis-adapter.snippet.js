// ===== Enable horizontal scaling of Socket.IO across many app servers =====
// Without this, two users on different server instances cannot see each other's
// messages. The Redis adapter broadcasts room events through ElastiCache so any
// instance can deliver to members connected to any other instance.
//
// 1) npm install @socket.io/redis-adapter redis
// 2) In config/socket.js, after creating `io` and before registering handlers:

const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

async function attachRedisAdapter(io) {
  if (!process.env.REDIS_URL) return; // dev: single instance, no adapter needed
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log("⚡ Socket.IO Redis adapter attached (multi-instance ready)");
}

module.exports = attachRedisAdapter;

// Usage inside initSocket(httpServer):
//   const io = new Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN?.split(",") || "*" } });
//   io.use(socketAuth);
//   await attachRedisAdapter(io);          // <-- add this line
//   registerSocketHandlers(io);
//
// NOTE: on the load balancer, enable sticky sessions (session affinity) so a
// client's long-lived WebSocket stays pinned to one instance for its lifetime.
