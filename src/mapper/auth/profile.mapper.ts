import type { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import type { IProfile, IProfilePopulated } from "../../models/profile";
import type { ProfileWithDistance } from "../../repositories/profile/IProfileRepository";
import type { IUser } from "../../models/user";
import type { IInterest } from "../../models/interest";

export class ProfileMapper {
  static toProfileResponse(profile: ProfileWithDistance | IProfilePopulated | IProfile): ProfileResponseDto {
    const user = profile.userId as unknown as IUser | undefined;
    const interests = profile.interests as unknown as (IInterest[] | undefined);

    return {
      id: profile._id.toString(),
      userId: user?._id?.toString() || profile.userId?.toString(),
      name: user?.name || "Unknown",
      age: profile.age,
      bio: profile.bio || "",
      gender: profile.gender,
      interestedIn: profile.interestedIn,
      profilePhoto: profile.profilePhoto ?? profile.photos?.[0] ?? null,
      coverPhoto: profile.coverPhoto ?? null,
      photos: profile.photos ?? [],
      interests: (interests || []).map((interest) =>
        typeof interest === 'object' && 'name' in interest ? interest.name : 'Unknown'
      ),
      distanceKm: (profile as ProfileWithDistance).distanceKm
    };
  }
}

