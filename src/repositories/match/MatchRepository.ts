import { BaseRepository } from "../base/BaseRepository";
import { IMatchAction, MatchAction } from "../../models/match-action";
import { IMatchRepository } from "./IMatchRepository";
import { injectable } from "inversify";
import { Types } from "mongoose";

@injectable()
export class MatchRepository  implements IMatchRepository {


    async createSwipe(data: { fromUserId: string; toUserId:string; action: 'like' | 'pass' }): Promise<IMatchAction> {
        return MatchAction.create({
            fromUserId: new Types.ObjectId(data.fromUserId),
            toUserId: new Types.ObjectId(data.toUserId),
            action: data.action
        })
    }

    async hasUserAlreadySwiped(fromUserId: string, toUserId: string): Promise<boolean> {
        const count = await MatchAction.countDocuments({ fromUserId: new Types.ObjectId(fromUserId), toUserId: new Types.ObjectId(toUserId) });
        return count > 0;
    }

    async getAction(fromUserId: string, toUserId: string): Promise<IMatchAction | null> {
        return MatchAction.findOne({ fromUserId: new Types.ObjectId(fromUserId), toUserId: new Types.ObjectId(toUserId) }).exec();
    }

    async getSwipedUserIds(fromUserId: string): Promise<string[]> {
        const actions = await MatchAction.find({ fromUserId: new Types.ObjectId(fromUserId) }).distinct('toUserId');
        return actions.map(id => id.toString());
    }
    
}
