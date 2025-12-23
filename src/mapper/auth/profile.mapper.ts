import { IProfile } from "../../models/profile";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";

export class ProfileMapper {
  static toProfileResponse(profile: IProfile): ProfileResponseDto {
    return {
      age: profile.age,
      gender: profile.gender,
      interestedIn: profile.interestedIn,
      photos: profile.photos ?? []
    };
  }
}
