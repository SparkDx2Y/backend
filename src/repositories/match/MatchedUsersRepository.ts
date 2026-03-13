import { injectable } from "inversify";
import { Match, IMatch, IMatchPopulated, IPopulatedUser } from "../../models/Match";
import { Profile } from "../../models/profile";
import { IMatchedUsersRepository } from "./IMatchedUsersRepository";

import { PipelineStage, Types } from "mongoose";


@injectable()
export class MatchedUsersRepository implements IMatchedUsersRepository {

    // create a new match
    async createMatch(users: [string, string]): Promise<IMatch> {
        
        const sortedUsers = [
            new Types.ObjectId(users[0]),
            new Types.ObjectId(users[1])
        ].sort((a, b) => a.toString().localeCompare(b.toString())) as [Types.ObjectId, Types.ObjectId];

        return Match.create({
            users: sortedUsers,
            lastMessageAt: null
        });
    }

    async findMatchByUsers(userId1: string, userId2: string): Promise<IMatch | null> {
        return Match.findOne({
            users: {
                $all: [
                    new Types.ObjectId(userId1),
                    new Types.ObjectId(userId2)
                ]
            }
        }).exec();
    }

    // find a match by id
    async findMatchById(matchId: string): Promise<IMatchPopulated | null> {
        const match = await Match.findById(matchId)
            .populate('users', 'name isBlocked')
            .lean()
            .exec() as unknown as IMatchPopulated | null;

        if (!match) return null;


        
        const userIds = match.users.map(u => u._id);
        const profiles = await Profile.find({ userId: { $in: userIds } }).select('userId profilePhoto').lean();

        const profileMap = new Map();
        profiles.forEach(p => profileMap.set(p.userId.toString(), p.profilePhoto));


        match.users.forEach((user: IPopulatedUser) => {
            user.profilePhoto = profileMap.get(user._id.toString());
        });

        return match;
    }

    // find all matches for a user
    async findMatchesByUserId(userId: string, page?: number, limit?: number, search?: string): Promise<IMatchPopulated[]> {
        const userObjId = new Types.ObjectId(userId);

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    users: userObjId
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'users',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $sort: { lastMessageAt: -1, createdAt: -1 }
            }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    users: {
                        $elemMatch: {
                            _id: { $ne: userObjId },
                            name: { $regex: search, $options: 'i' }
                        }
                    }
                }
            });
        }

        if (page && limit) {
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: limit });
        }

        const matches = await Match.aggregate(pipeline).exec() as unknown as IMatchPopulated[];

        const allMatchUserIds = matches.flatMap(m => m.users.map(u => u._id));
        const profiles = await Profile.find({ userId: { $in: allMatchUserIds } }).select('userId profilePhoto').lean();

        const profileMap = new Map();
        profiles.forEach(p => profileMap.set(p.userId.toString(), p.profilePhoto));

        matches.forEach(match => {
            match.users.forEach((user: IPopulatedUser) => {
                user.profilePhoto = profileMap.get(user._id.toString());
            });
        });

        return matches;
    }


    async hasMatch(userId1: string, userId2: string): Promise<boolean> {
        const count = await Match.countDocuments({
            users: {
                $all: [
                    new Types.ObjectId(userId1),
                    new Types.ObjectId(userId2)
                ]
            }
        });
        return count > 0;
    }

    // update last message at
    async updateLastMessageAt(matchId: string, timestamp: Date): Promise<void> {
        await Match.findByIdAndUpdate(matchId, {
            lastMessageAt: timestamp
        });
    }

    async deleteMatchByUsers(userId1: string, userId2: string): Promise<void> {
        await Match.findOneAndDelete({
            users: {
                $all: [
                    new Types.ObjectId(userId1),
                    new Types.ObjectId(userId2)
                ]
            }
        });
    }
}
