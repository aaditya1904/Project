import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import signinRoutes from './routes/signin.js';

dotenv.config();
connectDB();

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/', signinRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
