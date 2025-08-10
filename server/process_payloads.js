// Simple script that reads JSON payload files from ./payloads and sends them to the local server endpoint or inserts directly.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('./models/Message');
const PAYLOAD_DIR = path.join(__dirname, 'payloads');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp';

async function main(){
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for processing payloads');
  const files = fs.existsSync(PAYLOAD_DIR) ? fs.readdirSync(PAYLOAD_DIR).filter(f=>f.endsWith('.json')) : [];
  for(const f of files){
    try{
      const raw = fs.readFileSync(path.join(PAYLOAD_DIR,f),'utf-8');
      const payload = JSON.parse(raw);
      // reuse upsert logic from server by requiring server.js functions would cause circular deps; replicate minimal insert
      const message_id = payload.id || payload.message_id || (payload.message && payload.message.id) || ('p_' + Date.now());
      const wa_id = payload.wa_id || payload.from || (payload.message && payload.message.from) || 'unknown';
      const text = payload.text || (payload.message && (payload.message.body || payload.message.text)) || '';
      const ts = payload.timestamp ? new Date(payload.timestamp) : new Date();
      const status = payload.status || (payload.message && payload.message.status) || 'sent';

      let m = await Message.findOne({ $or: [{ message_id }, { meta_msg_id: payload.meta_msg_id }]});
      if(!m){
        m = new Message({
          message_id,
          meta_msg_id: payload.meta_msg_id || null,
          wa_id,
          from: payload.from || null,
          to: payload.to || null,
          text: typeof text === 'object' ? JSON.stringify(text) : text,
          timestamp: ts,
          direction: payload.direction || 'in',
          status,
          raw: payload
        });
        await m.save();
        console.log('Inserted', message_id);
      } else {
        if(status && status !== m.status){
          m.status = status;
          await m.save();
          console.log('Updated status for', m.message_id, '->', status);
        }
      }
    }catch(e){
      console.error('Error processing', f, e);
    }
  }
  mongoose.disconnect();
  console.log('Done.');
}

main().catch(e=>{ console.error(e); process.exit(1); });
