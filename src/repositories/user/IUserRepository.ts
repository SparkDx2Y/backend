import { IUser } from "../../models/user";
import { IBaseRepository } from "../base/IBaseRepository";


export interface IUserRepository extends IBaseRepository<IUser> {

    //? find a user by email
    findByEmail(email: string) : Promise<IUser | null>

    //? mark a user as verified
    markVerified(userId: string): Promise<IUser | null>

    //? update a user's password
    updatePassword(userId: string, newPassword: string): Promise<IUser | null>

    //? block a user
    blockUser(userId: string): Promise<IUser | null>

    //? unblock a user
    unblockUser(userId: string): Promise<IUser | null>
}

