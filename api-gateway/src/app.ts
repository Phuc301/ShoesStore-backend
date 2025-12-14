import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/user.route';
import productRoutes from './routes/product.route';
import voucherRoutes from './routes/voucher.route';
import cartRoutes from './routes/cart.route';
import orderRoutes from './routes/order.route';
import mediaRoutes from './routes/media.route';

dotenv.config();

const app = express();
const allowedOrigin = process.env.CORS_ORIGINS!;
// Middlewares
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
// app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Auto self-ping in production
if (process.env.NODE_ENV === 'production') {
  // Service URLs
  const services: string[] = [
    // process.env.AUTH_SERVICE_URL || '',
    // process.env.USER_SERVICE_URL || '',
    // process.env.SUBSCRIPTION_SERVICE_URL || '',
    // process.env.PAYMENT_SERVICE_URL || '',
    // process.env.JOB_SERVICE_URL || '',
    // process.env.NOTIFICATION_SERVICE_URL || '',
  ].filter(Boolean);
  // Ping a URL with timeout using native fetch
  async function pingService(
    url: string,
    timeoutMs = 5000
  ): Promise<{ url: string; status: string; message?: string }> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const resp = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      return { url, status: 'ok' };
    } catch (err: any) {
      return { url, status: 'error', message: err.message };
    }
  }
  // Health check route
  app.get('/api/keep-alive', async (_req, res) => {
    const results = await Promise.allSettled(
      services.map((url) => pingService(url))
    );

    const formatted = results.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : { url: '', status: 'error', message: String(r.reason) }
    );

    res.json({
      time: new Date().toISOString(),
      results: formatted,
    });
  });
  // Auto self-ping every 12 minutes
  if (process.env.API_GATEWAY_URL) {
    setInterval(
      async () => {
        try {
          const resp = await fetch(
            `${process.env.API_GATEWAY_URL}/api/keep-alive`
          );
          console.log(
            `[keep-alive] Self ping: ${
              resp.status
            } at ${new Date().toISOString()}`
          );
        } catch (err: any) {
          console.warn(`[keep-alive] Self ping error: ${err.message}`);
        }
      },
      12 * 60 * 1000
    );
  }
}

// Routes
userRoutes(app);
productRoutes(app);
voucherRoutes(app);
cartRoutes(app);
orderRoutes(app);
mediaRoutes(app);

export default app;
