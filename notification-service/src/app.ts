import express from 'express';
import dotenv from 'dotenv';
import './subscribers/notification.subscriber';

dotenv.config();

const app = express();
app.use(express.json());

export default app;
