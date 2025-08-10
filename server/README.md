Server README
-------------
1. Copy `.env.example` to `.env` and set MONGODB_URI (MongoDB Atlas connection string).
2. Run `npm install`.
3. Start server: `npm run start` (or `npm run dev` if you have nodemon).
4. Endpoints:
   - GET /api/conversations   -> list conversations grouped by wa_id
   - GET /api/messages/:wa_id -> messages for a conversation
   - POST /api/messages       -> add a new outgoing message (saves to DB)
   - POST /api/webhook        -> accepts a webhook payload (single) and processes it
5. Script:
   - `npm run process` will run process_payloads.js which reads JSON files from ./payloads and inserts/updates messages.

ADDITIONAL:
- Added sample group payload in server/payloads/sample_group.json
- Server emits/receives 'typing' socket events for demo.
