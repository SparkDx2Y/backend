import { IUser } from "../../models/user";

export interface UserWithProfile {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    role: 'user' | 'admin';
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    profilePhoto?: string | null;
}

export interface IAdminService {
    getAllUsers(): Promise<UserWithProfile[]>;
    updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<IUser | null>;
}

