import type { UserResponseDto } from "../../dto/response/auth/user-response.dto";
import type { IUser } from "../../models/user";


export class UserMapper {
    static toUserResponseDto(user: IUser, isProfileCompleted: boolean, isInterestsSelected: boolean, isLocationCompleted: boolean, profilePhoto?: string | null, interests?: string[]): UserResponseDto {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profilePhoto: profilePhoto || null,
            interests: interests || [],
            isProfileCompleted,
            isInterestsSelected,
            isLocationCompleted,
            hasPassword: !!user.password
        }
    }
}