import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IReportService } from "../../service/report/IReportService";
import { CreateReportSchema } from "../../dto/request/report/create-report.dto";
import { sendResponse } from "../../utils/responseHelper";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { REPORT_STATUS, ReportStatus } from "../../constants/report/report.constants";

@injectable()
export class ReportController {
    constructor(
        @inject(DI_TYPES.SERVICES.REPORT_SERVICE) private readonly _reportService: IReportService
    ) { }

    createReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const { reportedUser, reason, description, image } = CreateReportSchema.parse(req.body);

            const report = await this._reportService.createReport(
                req.user.id,
                reportedUser,
                reason,
                description,
                image
            );

            sendResponse(res, HTTP_STATUS.OK, "User reported successfully", report);
        } catch (error) {
            next(error);
        }
    };

    getReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reports = await this._reportService.getReports();
            sendResponse(res, HTTP_STATUS.OK, "Reports fetched successfully", reports);
        } catch (error) {
            next(error);
        }
    };

    updateReportStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reportId } = req.params;
            const { status } = req.body;

            if (!req.user || !req.user.id) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            if (!reportId) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "Report ID is required");
            }


            const report = await this._reportService.updateReportStatus(reportId, status, req.user.id);
            sendResponse(res, HTTP_STATUS.OK, `Report status updated to ${status}`, report);
        } catch (error) {
            next(error);
        }
    };
}
