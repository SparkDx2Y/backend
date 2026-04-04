import type { IProfileView } from "../../models/ProfileView";
import type { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";

export interface IProfileViewRepository {

    upsertView(viewerId: string, viewedId: string): Promise<{ view: IProfileView, isNewView: boolean }>;

    getViewsWithUsers(viewedId: string, limit?: number): Promise<MatchActionWithUsersDto[]>;
}
