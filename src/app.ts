import 'reflect-metadata'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import connectDB from './config/dbConfig'

//? container 
import container from './di/index'

//? dotenv config
dotenv.config();

//? database connection
connectDB();


//? create express app
const app = express()

//? importing the routes
import routes from './routes/route'


//? middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}))

//? routes
app.use('/api', routes)


//? exporting the app
export default app;
