import { LoginResponseDto } from "../../dto/response/auth/login-response.dto";
import { IUser } from "../../models/user";
import { UserMapper } from "./user.mapper";


export class AuthMapper {
    static toAuthResponseDto(user: IUser, token: string, refreshToken: string, isProfileCompleted: boolean, profilePhoto?: string | null): LoginResponseDto {
        return {
            token,
            refreshToken,
            user: UserMapper.toUserResponseDto(user, profilePhoto),
            isProfileCompleted
        }
    }
}