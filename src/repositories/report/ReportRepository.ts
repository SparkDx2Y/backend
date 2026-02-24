import { injectable } from "inversify";
import mongoose from "mongoose";
import { BaseRepository } from "../base/BaseRepository";
import { IReport, Report } from "../../models/Report";
import { CreateReportData, IReportRepository } from "./IReportRepository";
import { ReportStatus } from "../../constants/report/report.constants";

@injectable()
export class ReportRepository extends BaseRepository<IReport> implements IReportRepository {
    constructor() {
        super(Report);
    }

    async findByReporterAndReported(reporterId: string, reportedId: string): Promise<IReport | null> {
        return this.model.findOne({ reportedBy: reporterId, reportedUser: reportedId });
    }

    async createReport(data: CreateReportData): Promise<IReport> {
        return this.model.create({
            reportedBy: new mongoose.Types.ObjectId(data.reportedBy),
            reportedUser: new mongoose.Types.ObjectId(data.reportedUser),
            reason: data.reason,
            status: 'pending',
            description: data.description,
            image: data.image
        });
    }

    async findAllWithDetails(): Promise<IReport[]> {
        return this.model.find()
            .populate('reportedBy', 'name email isBlocked')
            .populate('reportedUser', 'name email isBlocked')
            .sort({ createdAt: -1 });
    }

    async updateStatus(id: string, status: ReportStatus): Promise<IReport | null> {
        return this.model.findByIdAndUpdate(id, { status }, { new: true })
            .populate('reportedBy', 'name email isBlocked')
            .populate('reportedUser', 'name email isBlocked');
    }
}
