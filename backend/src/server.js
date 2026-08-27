require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const initSocket = require('./config/socket');
const errorMiddleware = require('./middleware/error.middleware');
const { sendError } = require('./utils/apiResponse');

// نوصل بقاعدة البيانات MongoDB
connectDB();

const app = express();

// ===== إعدادات أساسية =====
app.use(cors());                  // نسمح للفرونت (على بورت تاني) يكلّم الباك
app.use(express.json());          // نقدر نقرأ JSON من جسم الطلب
app.use(morgan('dev'));           // نطبع كل طلب في الكونسول (مفيد للمتابعة)

// الملفات المرفوعة محلياً تكون متاحة على /uploads
// (لو Cloudinary متظبّط، الملفات بتروح هناك والمسار ده مش بيتستخدم)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== كل مسارات الـAPI تحت الإصدار الأول =====
app.use('/api/v1', require('./routes/v1'));

// ===== لو حد طلب مسار مش موجود =====
app.use((req, res) => sendError(res, 404, 'المسار غير موجود'));

// ===== معالج الأخطاء المركزي — لازم يكون آخر واحد =====
app.use(errorMiddleware);

// ===== سيرفر HTTP + Socket.IO =====
// Express لوحده مابيعرفش يعمل WebSocket، فبنعمل سيرفر HTTP
// ونركّب عليه Express و Socket.IO مع بعض على نفس البورت.
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 السيرفر شغّال على http://localhost:${PORT}`));
