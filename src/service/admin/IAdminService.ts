import { AdminUserListResponseDto } from "../../dto/response/admin/admin.userList.response";
import { IUser } from "../../models/user";


export interface IAdminService {

    getAllUsers(search: string, page: number, limit: number): Promise<{ users: AdminUserListResponseDto[], total: number }>;
    updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<void>;

}

