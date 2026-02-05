import { injectable } from "inversify";
import { ISocketService } from "./ISocketService";

@injectable()
export class SocketServiceWrapper implements ISocketService {
    private _socketService: ISocketService | null = null;

    public initialize(socketService: ISocketService) {
        this._socketService = socketService;
    }

    sendNotification(userId: string, notification: any): boolean {
        if (!this._socketService) return false;
        return this._socketService.sendNotification(userId, notification);
    }

    sendMessage(userId: string, message: any): boolean {
        if (!this._socketService) return false;
        return this._socketService.sendMessage(userId, message);
    }

    sendMatch(userId: string, matchData: any): boolean {
        if (!this._socketService) return false;
        return this._socketService.sendMatch(userId, matchData);
    }

    isUserOnline(userId: string): boolean {
        if (!this._socketService) return false;
        return this._socketService.isUserOnline(userId);
    }
}
