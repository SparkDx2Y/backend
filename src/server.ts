import 'reflect-metadata'
import dotenv from 'dotenv'
import connectDB from './config/dbConfig'

//? dotenv config
dotenv.config();



//? importing the app
import app from './app'

//? port
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    })

  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()