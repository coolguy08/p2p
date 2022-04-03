import express from 'express';
import http from 'http';
import cors from 'cors';

import log from './utils/log';
import instantRoom from './instantRoom';
import { wss, rooms } from './sockets';

require('dotenv').config();

const {connect}=require('./api/mysql_db');

const CORS_ORIGIN = process.env.ORIGIN ? JSON.parse(process.env.ORIGIN) : '*';
const PORT = process.env.PORT || 3030;

const api = require('./api');


const app = express();

//mysql connection
connect();

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));
app.use('/api/v1', api);

app.use('/instant-room', instantRoom);

const server = http.createServer(app);

app.get('/', (_, res) => {
  res.send({
    message: 'WebSockets running',
    rooms: Object.keys(rooms).length,
    peers: Object.values(rooms).reduce((sum, room) => sum + room.sockets.length, 0),
  });
});

server.on('upgrade', (request, socket, head) => {
  const origin = request.headers.origin;

  let allowed = false;
  if (CORS_ORIGIN === '*') {
    allowed = true;
  } else if (Array.isArray(CORS_ORIGIN)) {
    for(const o of CORS_ORIGIN) {
      if (o === origin) {
        allowed = true;
        break;
      }
    }
  }
  
  if (!allowed) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  } else {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log(`listening on *:${PORT}`);
});
