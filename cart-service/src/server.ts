import app from './app';
import { connectDB } from './config/dbConnection.config';

const PORT = process.env.PORT!;
console.log(process.env.PRODUCT_SERVICE_URL!);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀 Cart service shit started! Listening on http://localhost:${PORT}`
    );
  });
});


