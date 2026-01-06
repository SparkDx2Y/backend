import { IProfile } from "../../models/profile";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { IUser } from "../../models/user";

export class ProfileMapper {
  static toProfileResponse(profile: IProfile): ProfileResponseDto {
    const user = profile.userId as unknown as IUser;

    return {
      userId: user?._id?.toString() || profile.userId?.toString(),
      name: user?.name || "Unknown",
      age: profile.age,
      gender: profile.gender,
      interestedIn: profile.interestedIn,
      photos: profile.photos ?? []
    };
  }
}

