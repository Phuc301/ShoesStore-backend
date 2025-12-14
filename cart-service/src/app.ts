import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cartRoutes from './routes/cart.route';
import cartItemRoutes from './routes/cartItem.route';
import './subscribers/order.subscriber';

import { swaggerDocument, swaggerUi } from './swagger';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/cart-item', cartItemRoutes);

export default app;
