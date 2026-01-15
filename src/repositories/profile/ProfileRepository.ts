import { FilterQuery } from "mongoose";
import { IProfile, Profile } from "../../models/profile";
import { BaseRepository } from "../base/BaseRepository";
import { IProfileRepository } from "./IProfileRepository";



export class ProfileRepository extends BaseRepository<IProfile> implements IProfileRepository {

    constructor() {
        super(Profile)
    }

    async findByUserId(userId: string): Promise<IProfile | null> {
        return this.model.findOne({ userId }).populate("userId").exec();
    }

    async findPotentialMatches(excludeUserIds: string[], interestedIn: string, userGender: string, interests?: any[]): Promise<IProfile[]> {
        const query: FilterQuery<IProfile> = {
            userId: { $nin: excludeUserIds },
            gender: interestedIn,
            interestedIn: userGender // Mutual matching
        };

        // Strict Interest Matching: Only show users with at least one common interest
        if (interests && interests.length > 0) {
            query.interests = { $in: interests };
        }

        return this.model.find(query)
            .populate('userId', 'name profilePhoto')
            .limit(20)
            .exec();
    }
}

