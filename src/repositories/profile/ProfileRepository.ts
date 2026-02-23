import { Types } from "mongoose";
import type { IProfile} from "../../models/profile";
import { Profile } from "../../models/profile";
import { BaseRepository } from "../base/BaseRepository";
import type { IProfileRepository, MatchQuery, ProfileWithDistance } from "./IProfileRepository";



export class ProfileRepository extends BaseRepository<IProfile> implements IProfileRepository {

    constructor() {
        super(Profile)
    }

    async findByUserId(userId: string): Promise<IProfile | null> {
        return this.model.findOne({ userId })
            .populate("userId")
            .populate('interests', 'name')
            .exec();
    }

    async findPotentialMatches(queryInput: MatchQuery): Promise<ProfileWithDistance[]> {

        const pipeline: any[] = [
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [
                            queryInput.location.longitude,
                            queryInput.location.latitude
                        ]
                    },
                    distanceField: "distanceMeters",
                    spherical: true,
                    maxDistance: queryInput.maxDistanceKm * 1000,
                }
            },
            {
                $match: {
                    userId: {
                        $nin: queryInput.excludeUserIds.map(id => new Types.ObjectId(id))
                    },
                    gender: queryInput.interestedIn,
                    interestedIn: queryInput.userGender
                }
            }
        ];

        if (queryInput.interests?.length) {
            pipeline.push({
                $match: {
                    interests: { $in: queryInput.interests.map(id => new Types.ObjectId(id)) }
                }
            })
        }

        // LOOKUP (Populate) User Details
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userId"
            }
        });
        pipeline.push({
            $unwind: { path: "$userId", preserveNullAndEmptyArrays: false }
        });

        // LOOKUP (Populate) Interests
        pipeline.push({
            $lookup: {
                from: "interests",
                localField: "interests",
                foreignField: "_id",
                as: "interests"
            }
        });


        pipeline.push({ $limit: 20 })

        const result = await this.model.aggregate(pipeline);

        return result.map((p) => ({
            ...p,
            distanceKm: Math.round((p.distanceMeters / 1000) * 10) / 10
        }));
    }

    async updateByUserId(userId: string, data: Partial<IProfile>): Promise<IProfile | null> {

        return this.model.findOneAndUpdate(
            { userId },
            { $set: data },
            { new: true }
        )
            .populate("userId")
            .populate("interests", "name")
            .exec();
    }

}

