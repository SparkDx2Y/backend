import { injectable } from "inversify";
import { BaseRepository } from "../base/BaseRepository";
import { IUserRepository } from "./IUserRepository";
import { IUser, User } from "../../models/user";




@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(User)
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return this.model.findOne({ email }).exec()
    }

    async markVerified(userId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate( userId, { isVerified: true }, { new: true }).exec()
    }

    async updatePassword(userId: string, newPassword: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate( userId, { password: newPassword }, { new: true }).exec()
    }

}