import type { ServerOptions } from "socket.io";

const socketConfig: Partial<ServerOptions> = {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"]
    }
}

export default socketConfig;