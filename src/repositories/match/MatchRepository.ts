import { injectable } from "inversify";
import { FilterQuery, Types } from "mongoose";
import { IMatchAction, MatchAction } from "../../models/match-action";
import { IMatchRepository } from "./IMatchRepository";
import { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";

@injectable()
export class MatchRepository implements IMatchRepository {

    async createSwipe(data: { fromUserId: string; toUserId: string; action: 'like' | 'pass' }): Promise<IMatchAction> {
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

    async getTodaySwipeCount(userId: string, action: 'like' | 'pass'): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return MatchAction.countDocuments({
            fromUserId: new Types.ObjectId(userId),
            action,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).exec();
    }

    async getActions(filter: { fromUserId?: string; toUserId?: string; action?: 'like' | 'pass'; }): Promise<MatchActionWithUsersDto[]> {

        const query: FilterQuery<IMatchAction> = {};

        if (filter.fromUserId) {
            query.fromUserId = new Types.ObjectId(filter.fromUserId);
        }

        if (filter.toUserId) {
            query.toUserId = new Types.ObjectId(filter.toUserId);
        }

        if (filter.action) {
            query.action = filter.action;
        }

        return MatchAction.aggregate<MatchActionWithUsersDto>([
            { $match: query },
            // Populate "from" user data
            {
                $lookup: {
                    from: 'users',
                    localField: 'fromUserId',
                    foreignField: '_id',
                    as: 'fromUser'
                }
            },
            { $unwind: '$fromUser' },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'fromUserId',
                    foreignField: 'userId',
                    as: 'fromProfile'
                }
            },
            { $unwind: { path: '$fromProfile', preserveNullAndEmptyArrays: true } },

            // Populate "to" user data
            {
                $lookup: {
                    from: 'users',
                    localField: 'toUserId',
                    foreignField: '_id',
                    as: 'toUser'
                }
            },
            { $unwind: '$toUser' },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'toUserId',
                    foreignField: 'userId',
                    as: 'toProfile'
                }
            },
            { $unwind: { path: '$toProfile', preserveNullAndEmptyArrays: true } },

            // Final
            {
                $project: {
                    _id: { $toString: '$_id' },
                    action: 1,
                    createdAt: 1,
                    fromUserId: {
                        _id: { $toString: '$fromUser._id' },
                        name: '$fromUser.name',
                        profilePhoto: '$fromProfile.profilePhoto'
                    },
                    toUserId: {
                        _id: { $toString: '$toUser._id' },
                        name: '$toUser.name',
                        profilePhoto: '$toProfile.profilePhoto'
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }
}
