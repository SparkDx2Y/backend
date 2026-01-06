import { IBaseRepository } from "../base/IBaseRepository";
import { IProfile } from "../../models/profile";

export interface IProfileRepository extends IBaseRepository<IProfile> {

  findByUserId(userId: string): Promise<IProfile | null>;

  findPotentialMatches(excludeUserIds: string[], genderPreference: string): Promise<IProfile[]>;
}



