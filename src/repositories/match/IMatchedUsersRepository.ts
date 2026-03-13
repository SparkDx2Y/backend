import type { IMatch, IMatchPopulated } from "../../models/Match";

export interface IMatchedUsersRepository {

    createMatch(users: [string, string]): Promise<IMatch>;
    findMatchByUsers(userId1: string, userId2: string): Promise<IMatch | null>;

    findMatchById(matchId: string): Promise<IMatchPopulated | null>;

    findMatchesByUserId(userId: string, page?: number, limit?: number): Promise<IMatchPopulated[]>;

    hasMatch(userId1: string, userId2: string): Promise<boolean>;

    updateLastMessageAt(matchId: string, timestamp: Date): Promise<void>;

    deleteMatchByUsers(userId1: string, userId2: string): Promise<void>;
}
