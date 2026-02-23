import type { IBaseRepository } from "../base/IBaseRepository";
import type { IProfile } from "../../models/profile";
import type { Gender, GeoLocation } from "../../types/common";

export interface MatchQuery {
  excludeUserIds: string[];
  interestedIn: Gender;
  userGender: Gender;
  interests?: string[];
  location: GeoLocation;
  maxDistanceKm: number;
}

export interface ProfileWithDistance extends IProfile {
  distanceKm: number;
}
export interface IProfileRepository extends IBaseRepository<IProfile> {

  findByUserId(userId: string): Promise<IProfile | null>;

  findPotentialMatches(query: MatchQuery): Promise<ProfileWithDistance[]>;

  updateByUserId(userId: string,data: Partial<IProfile>): Promise<IProfile | null>;

}



