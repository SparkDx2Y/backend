import { inject, injectable } from "inversify";
import { IReportService } from "./IReportService";
import { DI_TYPES } from "../../di/types";
import { IReportRepository } from "../../repositories/report/IReportRepository";
import { IReport } from "../../models/Report";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

import { ReportReason, ReportStatus } from "../../constants/report/report.constants";

@injectable()
export class ReportService implements IReportService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.REPORT_REPOSITORY)
        private readonly _reportRepo: IReportRepository
    ) { }

    async createReport(reportedBy: string, reportedUser: string, reason: ReportReason, description?: string, image?: string): Promise<IReport> {
        if (reportedBy === reportedUser) {
            throw new AppError("You cannot report yourself", HTTP_STATUS.BAD_REQUEST);
        }

        const existingReport = await this._reportRepo.findByReporterAndReported(reportedBy, reportedUser);
        if (existingReport) {
            throw new AppError("You have already reported this user", HTTP_STATUS.CONFLICT);
        }

        return this._reportRepo.createReport({
            reportedBy,
            reportedUser,
            reason,
            description,
            image
        });
    }

    async getReports(): Promise<IReport[]> {
        return this._reportRepo.findAllWithDetails();
    }

    async updateReportStatus(reportId: string, status: ReportStatus): Promise<IReport> {
        const report = await this._reportRepo.updateStatus(reportId, status);
        if (!report) {
            throw new AppError("Report not found", HTTP_STATUS.NOT_FOUND);
        }
        return report;
    }
}
