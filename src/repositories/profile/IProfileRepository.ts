import type { IBaseRepository } from "../base/IBaseRepository";
import type { IProfile, IProfilePopulated } from "../../models/profile";
import type { Gender, GeoLocation } from "../../types/common";

export interface MatchQuery {
  excludeUserIds: string[];
  interestedIn: Gender;
  userGender: Gender;
  interests?: string[];
  location: GeoLocation;
  maxDistanceKm: number;
  minDistanceKm?: number;
  limit?: number;
}

export interface ProfileWithDistance extends IProfilePopulated {
  distanceKm: number;
}

export interface ProfileCreateData {
  userId: string;
  age: number;
  gender: Gender;
  interestedIn: Gender;
  profilePhoto: string;
  interests: string[];
  coverPhoto: string | null;
  photos: string[];
}

export interface ProfileUpdateData {
  age?: number;
  gender?: Gender;
  interestedIn?: Gender;
  profilePhoto?: string;
  vibeVideo?: string | null;
  interests?: string[];
  coverPhoto?: string | null;
  photos?: string[];
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface IProfileRepository extends IBaseRepository<IProfile> {

  findByUserId(userId: string): Promise<IProfilePopulated | null>;

  findPotentialMatches(query: MatchQuery): Promise<ProfileWithDistance[]>;

  updateByUserId(userId: string, data: ProfileUpdateData): Promise<IProfilePopulated | null>;

}
