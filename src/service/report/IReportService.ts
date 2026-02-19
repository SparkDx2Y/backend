import { IReport } from "../../models/Report";
import { REPORT_STATUS, ReportReason, ReportStatus } from "../../constants/report/report.constants";

export interface IReportService {
    createReport(reportedBy: string, reportedUser: string, reason: ReportReason, description?: string, image?: string): Promise<IReport>;
    getReports(): Promise<IReport[]>;
    updateReportStatus(reportId: string, status: ReportStatus): Promise<IReport>;
}
