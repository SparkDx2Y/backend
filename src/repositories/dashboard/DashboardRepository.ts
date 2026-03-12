import { injectable } from "inversify";
import { IDashboardRepository, DashboardRawData } from "./IDashboardRepository";
import { User } from "../../models/user";
import { UserSubscription } from "../../models/user-subscription";
import { Match } from "../../models/Match";

@injectable()
export class DashboardRepository implements IDashboardRepository {

    async getDashboardMetrics(from: Date, to: Date): Promise<DashboardRawData> {
        const [ 
            totalUsers, 
            newUsers, 
            premiumUsers, 
            expiredSubscriptions, 
            totalMatches, 
            newMatches, 
            revenueAgg, 
            revenueInRangeAgg, 
            revenueByDayAgg, 
            newUsersByDayAgg, 
            newMatchesByDayAgg 
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', createdAt: { $gte: from, $lte: to } }),
            UserSubscription.distinct('userId', { status: 'ACTIVE' }).then(ids => ids.length),
            UserSubscription.countDocuments({ status: 'EXPIRED' }),
            Match.countDocuments({}),
            Match.countDocuments({ createdAt: { $gte: from, $lte: to } }),

            UserSubscription.aggregate([
                { $group: { _id: null, total: { $sum: '$amountPaid' } } }
            ]),

            UserSubscription.aggregate([
                { $match: { createdAt: { $gte: from, $lte: to } } },
                { $group: { _id: null, total: { $sum: '$amountPaid' } } }
            ]),

            UserSubscription.aggregate([
                { $match: { createdAt: { $gte: from, $lte: to } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, value: { $sum: '$amountPaid' } } },
                { $sort: { _id: 1 } }
            ]),

            User.aggregate([
                { $match: { role: 'user', createdAt: { $gte: from, $lte: to } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, value: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),

            Match.aggregate([
                { $match: { createdAt: { $gte: from, $lte: to } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, value: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
        ]);

        return {
            totalUsers,
            newUsers,
            premiumUsers,
            expiredSubscriptions,
            totalMatches,
            newMatches,
            revenueAgg,
            revenueInRangeAgg,
            revenueByDayAgg,
            newUsersByDayAgg,
            newMatchesByDayAgg
        };
    }
}
