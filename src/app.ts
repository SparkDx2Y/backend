import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import connectDB from './config/db'

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

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}))



//? exporting the app
export default app;
