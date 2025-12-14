import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { swaggerDocument, swaggerUi } from './swagger';
import categoryRoutes from './routes/category.route';
import productRoutes from './routes/product.route';
import reviewRoutes from './routes/review.route';
import inventoryRoutes from './routes/inventory.route';
import './subscribers/inventory.subscriber';
import './subscribers/uploadImageUrl.subscriber';
import './subscribers/uploadVariantsUrl.subscriber';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/inventory', inventoryRoutes);

export default app;
