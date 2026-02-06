import { IProfile } from "../../models/profile";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { IUser } from "../../models/user";

export class ProfileMapper {
  static toProfileResponse(profile: any): ProfileResponseDto {
    const user = profile.userId as unknown as IUser;

    return {
      id: profile._id.toString(),
      userId: user?._id?.toString() || profile.userId?.toString(),
      name: user?.name || "Unknown",
      age: profile.age,
      gender: profile.gender,
      interestedIn: profile.interestedIn,
      profilePhoto: profile.profilePhoto ?? profile.photos?.[0] ?? null,
      coverPhoto: profile.coverPhoto ?? null,
      photos: profile.photos ?? [],
      interests: (profile.interests || []).map((interest: any) => interest?.name || 'Unknown'),
      distanceKm: profile.distanceKm
    };
  }
}

