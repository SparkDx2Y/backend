import type { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { ISocketService } from "../service/socket/ISocketService";
import socketConfig from "../config/socketConfig";
import type { IMatchedUsersRepository } from "../repositories/match/IMatchedUsersRepository";
import type { IMessageRepository } from "../repositories/message/IMessageRepository";
import logger from "../config/logger";
import type { SocketMatchPayload, SocketMessagePayload, SocketNotificationPayload } from "../service/socket/socket-payloads";

export class SocketServer implements ISocketService {
    private io: SocketIOServer;

    
    private userSockets: Map<string, Set<string>> = new Map();

    
    private userMatches: Map<string, string[]> = new Map();
    private activeCalls: Map<string, { callerId: string; startTime?: number }> = new Map();

    constructor(
        httpServer: HTTPServer,
        private matchedUsersRepo: IMatchedUsersRepository,
        private messageRepo: IMessageRepository
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

            
            socket.on("register", async (userId: string) => {
                socket.data.userId = userId;

                this.addUserSocket(userId, socket.id);

                socket.emit("connected", { userId, socketId: socket.id });

                await this.handleUserOnline(userId, socket);
            });

            
            socket.on("join_chat", (matchId: string) => {
                socket.join(matchId);
            });

            
            socket.on("leave_chat", (matchId: string) => {
                socket.leave(matchId);
            });


           
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
                const callerId = socket.data.userId || from?.id || from?.userId || from?._id;
                if (callerId && userToCall) {
                    this.activeCalls.set(this.getCallId(callerId, userToCall), { callerId });
                }
                this.notifyUser(userToCall, "call_user", { signal: signalData, from });
            });

            socket.on("answer_call", (data) => {
                const userId = socket.data.userId;
                if (userId && data.to) {
                    const callId = this.getCallId(userId, data.to);
                    const call = this.activeCalls.get(callId);
                    if (call) {
                        call.startTime = Date.now();
                    }
                }
                this.notifyUser(data.to, "call_accepted", data.signal);
            });

            socket.on("ice_candidate", ({ to, candidate }) => {
                this.notifyUser(to, "ice_candidate", candidate);
            });

            socket.on("end_call", async ({ to }) => {
                const userId = socket.data.userId;
                if (userId && to) {
                    await this.handleEndCall(userId, to);
                }
                this.notifyUser(to, "call_ended", {});
            });


           
            socket.on("disconnect", async () => {
                const userId = socket.data.userId;
                if (!userId) return;

                // Handle any active calls this user was in
                for (const [callId] of this.activeCalls.entries()) {
                    if (callId.includes(userId)) {
                        const otherUserId = callId.split('-').find(id => id !== userId);
                        if (otherUserId) {
                            await this.handleEndCall(userId, otherUserId);
                            this.notifyUser(otherUserId, "call_ended", {});
                        }
                    }
                }

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

        const matchedUserIds: string[] = matches.map((match) =>
            match.users
                .map((u) => u._id.toString())
                .find((id) => id !== userId)
        )
            .filter((id): id is string => !!id);

        this.userMatches.set(userId, matchedUserIds);

        return matchedUserIds;
    }

    private getCallId(id1: string, id2: string): string {
        return [id1, id2].sort().join('-');
    }

    private async handleEndCall(userId: string, otherUserId: string) {
        const callId = this.getCallId(userId, otherUserId);
        const call = this.activeCalls.get(callId);
        if (!call) return;

        this.activeCalls.delete(callId);

        try {
            const match = await this.matchedUsersRepo.findMatchByUsers(userId, otherUserId);
            if (!match) return;

            let content = "";
            if (call.startTime) {
                const durationSeconds = Math.floor((Date.now() - call.startTime) / 1000);
                const minutes = Math.floor(durationSeconds / 60);
                const seconds = durationSeconds % 60;
                content = `Video call ended (${minutes}:${seconds.toString().padStart(2, '0')})`;
            } else {
                
                content = userId === call.callerId ? "Cancelled video call" : "Missed video call";
            }

            const message = await this.messageRepo.createMessage({
                matchId: match._id.toString(),
                senderId: call.callerId,
                content,
                type: 'video_call'
            });

            await this.matchedUsersRepo.updateLastMessageAt(match._id.toString(), new Date());

            const messageResponse = {
                id: message._id.toString(),
                matchId: match._id.toString(),
                senderId: message.senderId.toString(),
                content: message.content,
                type: 'video_call',
                isRead: false,
                createdAt: message.createdAt
            };

            // Notify both users via socket
            [userId, otherUserId].forEach(uid => {
                this.notifyUser(uid, "message", {
                    type: 'message',
                    matchId: match._id.toString(),
                    message: messageResponse
                });
            });

        } catch (error) {
            logger.error("Error handling end call log:", error);
        }
    }

    /**
     * Notifies a specific user by sending an event to all their active sockets.
     */
    private notifyUser(userId: string, event: string, payload: unknown) {
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
    public sendNotification(userId: string, notification: SocketNotificationPayload): boolean {
        this.notifyUser(userId, "notification", notification);
        return this.userSockets.has(userId);
    }


    /**
     * Sends a real-time chat message to a specific user.
     */
    public sendMessage(userId: string, message: SocketMessagePayload): boolean {
        this.notifyUser(userId, "message", message);
        return this.userSockets.has(userId);
    }

    /**
    * Notifies a user of a new match.
    */
    public sendMatch(userId: string, matchData: SocketMatchPayload): boolean {
        // Invalidate cache when a new match occurs
        this.userMatches.delete(userId);

        this.notifyUser(userId, "match", matchData);
        return this.userSockets.has(userId);
    }

    /**
    * Returns true if the user has active connections.
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
