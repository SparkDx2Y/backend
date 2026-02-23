import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import requestLogger from './middlewares/requestLogger'

//? container 
import container from './di/index'

//? create express app
const app = express()

//? importing the routes
import routes from './routes/route'
import { errorHandler } from './middlewares/errorHandler'


//? middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestLogger);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}))

//? routes
app.use('/api', routes)

//? error handler
app.use(errorHandler)


//? exporting the app
export default app;
