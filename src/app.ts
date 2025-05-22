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

//? middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));



//? routes

//? exporting the app
export default app;

