import { IMatch } from "../../models/Match";

export interface IMatchedUsersRepository {

    createMatch(users: [string, string]): Promise<IMatch>;

    findMatchById(matchId: string): Promise<IMatch | null>;

    findMatchesByUserId(userId: string): Promise<IMatch[]>;

    hasMatch(userId1: string, userId2: string): Promise<boolean>;
    
    updateLastMessageAt(matchId: string, timestamp: Date): Promise<void>;
}
