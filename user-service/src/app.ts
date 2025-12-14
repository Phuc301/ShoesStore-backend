import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import addressRoutes from './routes/address.route';
import loyaltyRoutes from './routes/loyalty.route';
import codeRoutes from './routes/code.route';
import { swaggerDocument, swaggerUi } from './swagger';
import passport from 'passport';
import './core/passport.core';
import './subscribers/point.subscriber';
import './subscribers/uploadUrl.subscriber';

dotenv.config();

const app = express();

// Configure passport middleware
app.use(passport.initialize());

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/codes', codeRoutes);

export default app;
