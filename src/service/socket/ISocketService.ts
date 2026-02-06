export interface ISocketService {
    sendNotification(userId: string, notification: any): boolean;

    sendMessage(userId: string, message: any): boolean;

    sendMatch(userId: string, matchData: any): boolean;
    
    isUserOnline(userId: string): boolean;
}
