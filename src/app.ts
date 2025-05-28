import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db';


//? dotenv config
dotenv.config();

//? database connection
connectDB();

//? create express app
const app = express()

//? importing the routes
import authRoutes from './routes/user/auth.Routes'

//? middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));



//? routes
app.use('/api/auth', authRoutes)



//? exporting the app
export default app;

