import { BaseRepository } from "../base/BaseRepository";
import { IMatchAction, MatchAction } from "../../models/match-action";
import { IMatchRepository } from "./IMatchRepository";
import { injectable } from "inversify";

@injectable()
export class MatchRepository extends BaseRepository<IMatchAction> implements IMatchRepository {
    constructor() {
        super(MatchAction);
    }

    async hasUserActedOn(actorId: string, targetId: string): Promise<boolean> {
        const count = await this.model.countDocuments({ actorId, targetId });
        return count > 0;
    }

    async getAction(actorId: string, targetId: string): Promise<IMatchAction | null> {
        return this.model.findOne({ actorId, targetId }).exec();
    }

    async getUserHistory(actorId: string): Promise<string[]> {
        const actions = await this.model.find({ actorId }).distinct('targetId');
        return actions.map(id => id.toString());
    }
}
