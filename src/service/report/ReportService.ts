import { inject, injectable } from "inversify";
import { IReportService } from "./IReportService";
import { DI_TYPES } from "../../di/types";
import { IReportRepository } from "../../repositories/report/IReportRepository";
import { IReport } from "../../models/Report";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

import { ReportReason, ReportStatus } from "../../constants/report/report.constants";
import { REPORT_ERRORS } from "../../constants/errors/report.errors";

import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { ISocketService } from "../socket/ISocketService";
import { NotificationMapper } from "../../mapper/notification/notification.mapper";
import logger from "../../config/logger";

@injectable()
export class ReportService implements IReportService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.REPORT_REPOSITORY)
        private readonly _reportRepo: IReportRepository,
        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository,
        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService
    ) { }

    async createReport(reportedBy: string, reportedUser: string, reason: ReportReason, description?: string, image?: string): Promise<IReport> {
        if (reportedBy === reportedUser) {
            throw new AppError(REPORT_ERRORS.CANNOT_REPORT_SELF, HTTP_STATUS.BAD_REQUEST);
        }

        const existingReport = await this._reportRepo.findByReporterAndReported(reportedBy, reportedUser);
        if (existingReport) {
            throw new AppError(REPORT_ERRORS.ALREADY_REPORTED, HTTP_STATUS.CONFLICT);
        }

        const report = await this._reportRepo.createReport({
            reportedBy,
            reportedUser,
            reason,
            description,
            image
        });

        logger.info(`New report created: By ${reportedBy} on user ${reportedUser}, Reason: ${reason}`);
        return report;
    }

    async getReports(): Promise<IReport[]> {
        return this._reportRepo.findAllWithDetails();
    }

    async updateReportStatus(reportId: string, status: ReportStatus, adminId: string): Promise<IReport> {
        const report = await this._reportRepo.updateStatus(reportId, status);
        if (!report) {
            throw new AppError(REPORT_ERRORS.REPORT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

       
        if (status === 'resolved' || status === 'dismissed') {
            const reporterId = report.reportedBy._id.toString();
            const notificationType = status === 'resolved' ? 'report_resolved' : 'report_dismissed';

            const notification = await this._notificationRepo.create({
                userId: reporterId,
                type: notificationType,
                fromUserId: adminId
            });

            // Send real-time notification via socket
            this._socketService.sendNotification(reporterId, {
                type: notificationType,
                message: `Your report has been ${status}`,
                data: NotificationMapper.toResponse(notification)
            });
        }

        logger.info(`Report ${reportId} status updated to ${status} by admin ${adminId}`);

        return report;
    }
}
