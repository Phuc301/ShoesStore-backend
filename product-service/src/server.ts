import app from './app';
import { connectDB } from './config/dbConnection.config';
import http from 'http';
import { WSServer } from './ws/server.ws';

const PORT = process.env.PORT!;
const server = http.createServer(app);
new WSServer(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(
      `🚀 Product service started! Listening on http://localhost:${PORT}`
    );
  });
});
