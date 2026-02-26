export interface IProfileViewService {
    recordView(viewerId: string, viewedId: string): Promise<void>;
}
