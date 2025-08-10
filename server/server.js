require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors({
  origin: [
    "https://whatsapp-web-clone-git-main-harshithkps-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(bodyParser.json({ limit: '5mb' }));

// DB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(e=> console.error('Mongo connect error', e));

// ====== API ROUTES ======


// Get conversation list
app.get('/api/conversations', async (req,res)=>{
  const agg = await Message.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: {
      _id: "$wa_id",
      lastMessage: { $first: "$$ROOT" },
      count: { $sum: 1 }
    }},
    { $project: {
      wa_id: "$_id",
      lastMessage: 1,
      count: 1,
      _id: 0
    }},
    { $sort: { "lastMessage.timestamp": -1 } }
  ]);
  res.json(agg);
});

// Get messages by WA ID
app.get('/api/messages/:wa_id', async (req,res)=>{
  const wa = req.params.wa_id;
  const msgs = await Message.find({ wa_id: wa }).sort({ timestamp: 1 }).lean();
  res.json(msgs);
});

// Send a message to an existing chat
app.post('/api/messages', async (req,res)=>{
  const { wa_id, to, text } = req.body;
  const payload = {
    message_id: 'out_' + Date.now(),
    wa_id,
    from: 'me',
    to,
    text,
    timestamp: new Date(),
    direction: 'out',
    status: 'sent'
  };
  const m = new Message(payload);
  await m.save();
  io.emit('message:new', m);
  res.json(m);
});

// Create a new conversation (New Chat)
app.post('/api/conversations', async (req, res) => {
  try {
    const { wa_id, text, to } = req.body;
    if(!wa_id || !to) {
      return res.status(400).json({ ok:false, error: 'wa_id and to required' });
    }
    const payload = {
      message_id: 'out_' + Date.now(),
      wa_id,
      from: 'me',
      to,
      text: text || '',
      timestamp: new Date(),
      direction: 'out',
      status: 'sent',
      raw: { created_by: 'api' }
    };
    const m = new Message(payload);
    await m.save();
    io.emit('message:new', m);
    return res.json({ ok:true, message: m });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error: String(e) });
  }
});

// ====== SOCKET.IO ======
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// ====== START SERVER ======
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
