import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IReportService } from "../../service/report/IReportService";
import { CreateReportSchema } from "../../dto/request/report/create-report.dto";
import { sendResponse } from "../../utils/responseHelper";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { REPORT_ERRORS } from "../../constants/errors/report.errors";

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

            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.REPORT_SUBMITTED, report);
        } catch (error) {
            next(error);
        }
    };

    getReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reports = await this._reportService.getReports();
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.REPORTS_FETCHED, reports);
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
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, REPORT_ERRORS.REPORT_ID_REQUIRED);
            }


            const report = await this._reportService.updateReportStatus(reportId, status, req.user.id);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.REPORT_STATUS_UPDATED, report);
        } catch (error) {
            next(error);
        }
    };
}
