require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const initSocket = require('./config/socket');
const notificationService = require('./services/notification.service');
const errorMiddleware = require('./middleware/error.middleware');
const { sendError } = require('./utils/apiResponse');

const app = express();
let dbConnection;

function ensureDBConnection() {
  if (!dbConnection) {
    dbConnection = connectDB().catch((error) => {
      dbConnection = null;
      throw error;
    });
  }
  return dbConnection;
}

// ===== إعدادات أساسية =====
const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());
app.use(cors({ origin: corsOrigins.includes('*') ? '*' : corsOrigins }));
app.use(express.json());          // نقدر نقرأ JSON من جسم الطلب
app.use(morgan('dev'));           // نطبع كل طلب في الكونسول (مفيد للمتابعة)

// الملفات المرفوعة محلياً تكون متاحة على /uploads
// (لو Cloudinary متظبّط، الملفات بتروح هناك والمسار ده مش بيتستخدم)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  ensureDBConnection().then(() => next()).catch(next);
});

// ===== كل مسارات الـAPI تحت الإصدار الأول =====
const apiRoutes = require('./routes/v1');
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// ===== لو حد طلب مسار مش موجود =====
app.use((req, res) => sendError(res, 404, 'المسار غير موجود'));

// ===== معالج الأخطاء المركزي — لازم يكون آخر واحد =====
app.use(errorMiddleware);

// ===== سيرفر HTTP + Socket.IO =====
// Express لوحده مابيعرفش يعمل WebSocket، فبنعمل سيرفر HTTP
// ونركّب عليه Express و Socket.IO مع بعض على نفس البورت.
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  ensureDBConnection().then(() => {
    const server = http.createServer(app);
    initSocket(server);
    notificationService.startWeeklyDigest();
    server.listen(PORT, () => console.log(`🚀 السيرفر شغّال على http://localhost:${PORT}`));
  }).catch((error) => {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
