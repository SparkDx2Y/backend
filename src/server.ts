import 'reflect-metadata'
import dotenv from 'dotenv'

//? dotenv config
dotenv.config();

import http from 'http'
import connectDB from './config/dbConfig'

import { initSocket } from './socket';
//? importing the app
import app from './app'

//? port
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Socket.IO is ready for real-time communication`);
    })

  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()