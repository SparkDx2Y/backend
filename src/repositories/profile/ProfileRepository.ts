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

}