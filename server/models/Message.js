const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message_id: { type: String, index: true },
  meta_msg_id: String,
  wa_id: String,
  from: String,
  to: String,
  text: String,
  timestamp: Date,
  direction: { type: String, enum: ['in','out'], default: 'in' },
  status: { type: String, enum: ['sent','delivered','read','unknown'], default: 'unknown' },
  raw: Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
