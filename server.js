import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser'

import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';

dotenv.config();

//Connect to MongoDB
connectDB(); 

const PORT = process.env.PORT || 5000;

const app = express();

//Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie Parser middleware
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/budgets', budgetRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));