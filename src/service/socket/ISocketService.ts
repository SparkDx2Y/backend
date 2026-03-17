import type { SocketMatchPayload, SocketMessagePayload, SocketNotificationPayload } from "./socket-payloads";

export interface ISocketService {
    sendNotification(userId: string, notification: SocketNotificationPayload): boolean;

    sendMessage(userId: string, message: SocketMessagePayload): boolean;

    sendMatch(userId: string, matchData: SocketMatchPayload): boolean;

    isUserOnline(userId: string): boolean;
}
