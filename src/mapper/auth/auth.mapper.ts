import type { LoginResponseDto } from "../../dto/response/auth/login-response.dto";
import type { IUser } from "../../models/user";
import { UserMapper } from "./user.mapper";


export class AuthMapper {
    static toAuthResponseDto(user: IUser, accessToken: string, refreshToken: string, isProfileCompleted: boolean, isInterestsSelected: boolean, isLocationCompleted: boolean, profilePhoto?: string | null, interests?: string[]): LoginResponseDto {
        return {
            accessToken,
            refreshToken,
            user: UserMapper.toUserResponseDto(user, isProfileCompleted, isInterestsSelected, isLocationCompleted, profilePhoto, interests)
        }
    }
}