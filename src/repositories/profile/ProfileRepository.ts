import { IProfile, Profile } from "../../models/profile";
import { BaseRepository } from "../base/BaseRepository";
import { IProfileRepository } from "./IProfileRepository";



export class ProfileRepository extends BaseRepository<IProfile> implements IProfileRepository {

    constructor() {
        super(Profile)
    }

    async findByUserId(userId: string): Promise<IProfile | null> {
        return this.model.findOne({ userId }).exec()
    }

    async findPotentialMatches(excludeUserIds: string[], genderPreference: string): Promise<IProfile[]> {
        return this.model.find({
            userId: { $nin: excludeUserIds }, // Exclude self + history
            gender: genderPreference
        })
            .populate('userId', 'name')
            .exec();
    }
}

