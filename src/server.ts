import 'reflect-metadata'
import dotenv from 'dotenv'
import logger from './config/logger';
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
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Socket.IO is ready for real-time communication`);
    })

  } catch (error) {
    logger.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()