import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { ISocketService } from "../service/socket/ISocketService";
import socketConfig from "../config/socketConfig";
import { IMatchedUsersRepository } from "../repositories/match/IMatchedUsersRepository";
import logger from "../config/logger";

export class SocketServer implements ISocketService {
    private io: SocketIOServer;

    // userId -> set of socketIds (multi-device/tabs per user support)
    private userSockets: Map<string, Set<string>> = new Map();

    // userId -> matched userIds (in-memory cache)
    private userMatches: Map<string, string[]> = new Map();

    constructor(
        httpServer: HTTPServer,
        private matchedUsersRepo: IMatchedUsersRepository
    ) {
        this.io = new SocketIOServer(httpServer, socketConfig);
        this.setupEventHandlers();
    }

    // =========================
    // EVENT HANDLERS
    // sets up global event handlers for all connected sockets.it handles connections,chat rooms amd disconnection
    // =========================
    private setupEventHandlers() {
        this.io.on("connection", (socket: Socket) => {
            logger.debug("Socket connected:", socket.id);

            // Register user socket
            socket.on("register", async (userId: string) => {
                socket.data.userId = userId;

                this.addUserSocket(userId, socket.id);

                socket.emit("connected", { userId, socketId: socket.id });

                await this.handleUserOnline(userId, socket);
            });

            // Join chat
            socket.on("join_chat", (matchId: string) => {
                socket.join(matchId);
            });

            // Leave chat
            socket.on("leave_chat", (matchId: string) => {
                socket.leave(matchId);
            });


            // Typing event handler  for a members of a specific chat room
            socket.on("typing", ({ matchId, isTyping }: { matchId: string; isTyping: boolean }) => {
                const userId = socket.data.userId;
                if (!userId) return;

                socket.to(matchId).emit("typing", {
                    matchId,
                    userId,
                    isTyping,
                });
            }
            );

            // =========================
            // VIDEO CALL EVENTS
            // =========================
            socket.on("call_user", ({ userToCall, signalData, from }) => {
                this.notifyUser(userToCall, "call_user", { signal: signalData, from });
            });

            socket.on("answer_call", (data) => {
                this.notifyUser(data.to, "call_accepted", data.signal);
            });

            socket.on("ice_candidate", ({ to, candidate }) => {
                this.notifyUser(to, "ice_candidate", candidate);
            });

            socket.on("end_call", ({ to }) => {
                this.notifyUser(to, "call_ended", {});
            });


            // Disconnect event handler for removes the socket session and updates the user status
            socket.on("disconnect", async () => {
                const userId = socket.data.userId;
                if (!userId) return;

                const isFullyOffline = this.removeUserSocket(userId, socket.id);

                if (isFullyOffline) {
                    await this.handleUserOffline(userId);
                }

                logger.debug("Socket disconnected:", socket.id);
            });
        });
    }

    // =========================
    // ONLINE / OFFLINE HANDLING
    // =========================

    /**
   * Fetches mutual matches.
   * Notifies those matches that this user is online.
   * Sends the list of currently online matches to this user.
   */

    private async handleUserOnline(userId: string, socket: Socket) {
        try {
            const matchedUserIds = await this.getMatchedUserIds(userId);

            const onlineMatches: string[] = [];

            for (const matchedUserId of matchedUserIds) {
                if (this.isUserOnline(matchedUserId)) {
                    onlineMatches.push(matchedUserId);

                    this.notifyUser(matchedUserId, "user_online", userId);
                }
            }

            socket.emit("online_users", onlineMatches);
        } catch (error) {
            logger.error("Error handling user online:", error);
        }
    }

    /**
     * execute when a user goes fully offline (all devices disconnected).
     * Notifies all mutually matched users that this user is now offline.
     */
    private async handleUserOffline(userId: string) {
        try {
            const matchedUserIds = await this.getMatchedUserIds(userId);

            for (const matchedUserId of matchedUserIds) {
                this.notifyUser(matchedUserId, "user_offline", userId);
            }

            this.userMatches.delete(userId);
        } catch (error) {
            logger.error("Error handling user offline:", error);
        }
    }

    // =========================
    // HELPER METHODS 
    // =========================

    /**
     * Adds a socket to the user's set of active sockets.
     * Supports multi-device/tab usage per user.
     */
    private addUserSocket(userId: string, socketId: string) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socketId);
    }

    /**
     * Removes a socket.
     * Returns true if user is fully offline.
     */
    private removeUserSocket(userId: string, socketId: string): boolean {
        const sockets = this.userSockets.get(userId);
        sockets?.delete(socketId);

        if (!sockets || sockets.size === 0) {
            this.userSockets.delete(userId);
            return true;
        }

        return false;
    }

    /**
     * Retrieves the list of matched user IDs for a given user.
     * Uses cached results when available for performance.
     */
    private async getMatchedUserIds(userId: string): Promise<string[]> {
        if (this.userMatches.has(userId)) {
            return this.userMatches.get(userId)!;
        }

        const matches = await this.matchedUsersRepo.findMatchesByUserId(userId);

        const matchedUserIds: string[] = matches.map((match: any) =>
            match.users
                .map((u: any) => (u._id ? u._id.toString() : u.toString()))
                .find((id: string) => id !== userId)
        )
            .filter(Boolean);

        this.userMatches.set(userId, matchedUserIds);

        return matchedUserIds;
    }

    /**
     * Notifies a specific user by sending an event to all their active sockets.
     */
    private notifyUser(userId: string, event: string, payload: any) {
        const sockets = this.userSockets.get(userId);
        sockets?.forEach(socketId => {
            this.io.to(socketId).emit(event, payload);
        });
    }

    // =========================
    // PUBLIC API
    // =========================

    /**
     * Sends a notification to a specific user.
     */
    public sendNotification(userId: string, notification: any): boolean {
        this.notifyUser(userId, "notification", notification);
        return this.userSockets.has(userId);
    }


    /**
     * Sends a real-time chat message to a specific user.
     */
    public sendMessage(userId: string, message: any): boolean {
        this.notifyUser(userId, "message", message);
        return this.userSockets.has(userId);
    }

    /**
    * Notifies a user of a new match.
    */
    public sendMatch(userId: string, matchData: any): boolean {
        // Invalidate cache when a new match occurs
        this.userMatches.delete(userId);

        this.notifyUser(userId, "match", matchData);
        return this.userSockets.has(userId);
    }

    /**
    * Returns true if the user has any active connections.
    */
    public isUserOnline(userId: string): boolean {
        return this.userSockets.has(userId);
    }

    /**
    * Returns a list of all currently online user IDs.
    */
    public getOnlineUsers(): string[] {
        return Array.from(this.userSockets.keys());
    }


    public getIO(): SocketIOServer {
        return this.io;
    }
}
