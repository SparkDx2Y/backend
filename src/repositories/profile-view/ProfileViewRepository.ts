import { injectable } from "inversify";
import { IProfileViewRepository } from "./IProfileViewRepository";
import { IProfileView, ProfileView } from "../../models/ProfileView";
import mongoose from "mongoose";

@injectable()
export class ProfileViewRepository implements IProfileViewRepository {

    async upsertView(viewerId: string, viewedId: string): Promise<{ view: IProfileView, isNewView: boolean }> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find existing view from this user to that user
        const existingView = await ProfileView.findOne({
            viewerId: new mongoose.Types.ObjectId(viewerId),
            viewedId: new mongoose.Types.ObjectId(viewedId)
        });

        if (existingView) {
            const isNewViewForNotification = existingView.lastViewedAt < twentyFourHoursAgo;

            existingView.lastViewedAt = new Date();
            await existingView.save();

            return { view: existingView, isNewView: isNewViewForNotification };
        }

        // Create new view
        const newView = await ProfileView.create({
            viewerId: new mongoose.Types.ObjectId(viewerId),
            viewedId: new mongoose.Types.ObjectId(viewedId),
            lastViewedAt: new Date()
        });

        return { view: newView, isNewView: true };
    }

    async getViewsByViewedId(viewedId: string, limit: number = 20): Promise<IProfileView[]> {

        return ProfileView.find({ viewedId: new mongoose.Types.ObjectId(viewedId) })
            .sort({ lastViewedAt: -1 })
            .limit(limit)
            .populate('viewerId');
    }
}
