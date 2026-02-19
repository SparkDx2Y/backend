import { IReport } from "../../models/Report";
import { IBaseRepository } from "../base/IBaseRepository";
import { ReportReason, ReportStatus } from "../../constants/report/report.constants";

export interface CreateReportData {
    reportedBy: string;
    reportedUser: string;
    reason: ReportReason;
    description?: string | undefined;
    image?: string | undefined;
}

export interface IReportRepository extends IBaseRepository<IReport> {
    findByReporterAndReported(reporterId: string, reportedId: string): Promise<IReport | null>;
    createReport(data: CreateReportData): Promise<IReport>;
    findAllWithDetails(): Promise<IReport[]>;
    updateStatus(id: string, status: ReportStatus): Promise<IReport | null>;
}
