import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { ISocketService } from "../service/socket/ISocketService";
import socketConfig from "../config/socketConfig";

interface UserSocket {
    userId: string;
    socketId: string;
}

export class SocketServer implements ISocketService {
    private io: SocketIOServer;
    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, socketConfig);

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on("connection", (socket: Socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // User registers their socket with their user ID
            socket.on("register", (userId: string) => {
                this.userSockets.set(userId, socket.id);

                // Notify user they're connected
                socket.emit("connected", { userId, socketId: socket.id });

                // 1. Broadcast to ALL other users that this user is online
                socket.broadcast.emit("user_online", userId);

                // 2. Send the list of currently online users to the newly connected user
                socket.emit("online_users", Array.from(this.userSockets.keys()));
            });

            // Handle typing indicator
            socket.on("typing", (data: { matchId: string; userId: string; isTyping: boolean }) => {
                // Broadcast to other user in the match
                socket.broadcast.emit("typing", data);
            });

            // Handle disconnect
            socket.on("disconnect", () => {
                // Remove user from map
                for (const [userId, socketId] of this.userSockets.entries()) {
                    if (socketId === socket.id) {
                        this.userSockets.delete(userId);
                        // 3. Broadcast that this user went offline
                        socket.broadcast.emit("user_offline", userId);
                        break;
                    }
                }
            });

        });
    }

    // Send notification to a specific user
    public sendNotification(userId: string, notification: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit("notification", notification);
            return true;
        }
        return false;
    }

    // Send message to a specific user
    public sendMessage(userId: string, message: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit("message", message);
            return true;
        }
        return false;
    }

    // Send match notification to a specific user
    public sendMatch(userId: string, matchData: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit("match", matchData);
            return true;
        }
        return false;
    }

    // Check if user is online
    public isUserOnline(userId: string): boolean {
        return this.userSockets.has(userId);
    }

    // Get all online users
    public getOnlineUsers(): string[] {
        return Array.from(this.userSockets.keys());
    }

    // Get socket instance for advanced usage
    public getIO(): SocketIOServer {
        return this.io;
    }
}
