import { injectable } from "inversify";
import { BaseRepository } from "../base/BaseRepository";
import { IUserRepository } from "./IUserRepository";
import { IUser, User } from "../../models/user";
import { AdminUserListResponseDto } from "../../dto/response/admin/admin.userList.response";
import { FilterQuery } from "mongoose";




@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(User)
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return this.model.findOne({ email }).exec()
    }

    async findByGoogleId(googleId: string): Promise<IUser | null> {
        return this.model.findOne({ googleId }).exec()
    }

    async updateGoogleId(userId: string, googleId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { googleId }, { new: true }).exec()
    }

    async markVerified(userId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { isVerified: true }, { new: true }).exec()
    }

    async updatePassword(userId: string, newPassword: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { password: newPassword }, { new: true }).exec()
    }

    async blockUser(userId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { isBlocked: true }, { new: true }).exec()
    }

    async unblockUser(userId: string): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(userId, { isBlocked: false }, { new: true }).exec()
    }

    async findUsersForAdmin(search: string, page: number, limit: number): Promise<{ users: AdminUserListResponseDto[], total: number }> {

        const matchStage: FilterQuery<IUser> = { role: 'user' }
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        const skip = (page - 1) * limit
        const [result] = await this.model.aggregate<{
            users: AdminUserListResponseDto[];
            totalCount: { total: number }[];
        }>([
            { $match: matchStage },
            { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    isVerified: 1,
                    role: 1,
                    isBlocked: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    profilePhoto: '$profile.profilePhoto'
                }
            },
            {
                $facet: {
                    users: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'total' }
                    ]
                }
            }
        ]).exec()

        return {
            users: result?.users || [],
            total: result?.totalCount[0]?.total ?? 0
        }
    }

    async isUserBlocked(userId: string): Promise<boolean> {
        const user = await this.model.findById(userId).select('isBlocked').lean()
        return user?.isBlocked ?? false
    }

}