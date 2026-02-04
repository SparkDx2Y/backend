import { injectable } from "inversify";
import { Match, IMatch } from "../../models/Match";
import { Profile } from "../../models/profile";
import { IMatchedUsersRepository } from "./IMatchedUsersRepository";

import { Types } from "mongoose";


@injectable()
export class MatchedUsersRepository implements IMatchedUsersRepository {

    // create a new match
    async createMatch(users: [string, string]): Promise<IMatch> {
        // Sort users to ensure consistent ordering (prevents duplicate matches)
        const sortedUsers = [
            new Types.ObjectId(users[0]),
            new Types.ObjectId(users[1])
        ].sort((a, b) => a.toString().localeCompare(b.toString())) as [Types.ObjectId, Types.ObjectId];

        return Match.create({
            users: sortedUsers,
            lastMessageAt: null
        });
    }

    // find a match by id
    async findMatchById(matchId: string): Promise<IMatch | null> {
        const match = await Match.findById(matchId)
            .populate('users', 'name')
            .lean()
            .exec();

        if (!match) return null;


        // extract userid from the match for profile photo
        const userIds = match.users.map(u => u._id);
        const profiles = await Profile.find({ userId: { $in: userIds } }).select('userId profilePhoto').lean();

        const profileMap = new Map();
        profiles.forEach(p => profileMap.set(p.userId.toString(), p.profilePhoto));

        
        match.users.forEach((user: any) => {
            user.profilePhoto = profileMap.get(user._id.toString());
        });

        return match as unknown as IMatch;
    }

    // find all matches for a user
    async findMatchesByUserId(userId: string): Promise<IMatch[]> {
        const matches = await Match.find({
            users: new Types.ObjectId(userId)
        })
            .populate('users', 'name')
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .lean()
            .exec();

        const userIds = matches.flatMap(m => m.users.map(u => u._id));
        const profiles = await Profile.find({ userId: { $in: userIds } }).select('userId profilePhoto').lean();

        const profileMap = new Map();
        profiles.forEach(p => profileMap.set(p.userId.toString(), p.profilePhoto));

        matches.forEach(match => {
            match.users.forEach((user: any) => {
                user.profilePhoto = profileMap.get(user._id.toString());
            });
        });

        return matches as unknown as IMatch[];
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
}
