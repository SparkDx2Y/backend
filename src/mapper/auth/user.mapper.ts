import { UserResponseDto } from "../../dto/response/auth/user-response.dto";
import { IUser } from "../../models/user";


export class UserMapper {
    static toUserResponseDto(user: IUser): UserResponseDto {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    }
}