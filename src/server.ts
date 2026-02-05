import 'reflect-metadata'
import dotenv from 'dotenv'
import http from 'http'
import connectDB from './config/dbConfig'
import { SocketServer } from './socket/SocketServer'

//? dotenv config
dotenv.config();



import container from './di/index'
import { DI_TYPES } from './di/types'
import { SocketServiceWrapper } from './service/socket/SocketServiceWrapper'
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
    const socketServer = new SocketServer(httpServer);

    // Initialize the SocketServiceWrapper through DI container
    // This allows services (like MatchService) to have already been created with the wrapper injected
    const socketServiceWrapper = container.get<SocketServiceWrapper>(DI_TYPES.SERVICES.SOCKET_SERVICE);
    socketServiceWrapper.initialize(socketServer);

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