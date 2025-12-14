import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import voucherRoutes from './routes/voucher.route';
import { swaggerDocument, swaggerUi } from './swagger';
import './subscribers/applyVoucher.subscriber'

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/voucher', voucherRoutes);
export default app;
