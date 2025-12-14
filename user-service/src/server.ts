import app from './app';
import { connectDB } from './config/dbConnection.config';

const PORT = process.env.PORT!;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀 User service started! Listening on http://localhost:${PORT}`
    );
  });
});
