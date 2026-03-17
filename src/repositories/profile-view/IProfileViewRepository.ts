import type { IProfileView } from "../../models/ProfileView";

export interface IProfileViewRepository {

    upsertView(viewerId: string, viewedId: string): Promise<{ view: IProfileView, isNewView: boolean }>;

    getViewsWithUsers(viewedId: string, limit?: number): Promise<any[]>;
}
