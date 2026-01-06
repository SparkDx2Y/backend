import { BaseRepository } from "../base/BaseRepository";
import { IMatchAction, MatchAction } from "../../models/match-action";
import { IMatchRepository } from "./IMatchRepository";
import { injectable } from "inversify";

@injectable()
export class MatchRepository extends BaseRepository<IMatchAction> implements IMatchRepository {
    constructor() {
        super(MatchAction);
    }

    async hasUserAlreadySwiped(fromUserId: string, toUserId: string): Promise<boolean> {
        const count = await this.model.countDocuments({ fromUserId, toUserId });
        return count > 0;
    }

    async getAction(fromUserId: string, toUserId: string): Promise<IMatchAction | null> {
        return this.model.findOne({ fromUserId, toUserId }).exec();
    }

    async getSwipedUserIds(fromUserId: string): Promise<string[]> {
        const actions = await this.model.find({ fromUserId }).distinct('toUserId');
        return actions.map(id => id.toString());
    }
    
}
