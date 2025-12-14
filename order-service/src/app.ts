import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { swaggerDocument, swaggerUi } from './swagger';
import orderRoutes from './routes/order.route';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);

export default app;
