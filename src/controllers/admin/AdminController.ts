import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IAdminService } from "../../service/admin/IAdminService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { ADMIN_MESSAGES } from "../../constants/admin/admin.messages";

@injectable()
export class AdminController {

  constructor(
    @inject(DI_TYPES.SERVICES.ADMIN_SERVICE)
    private readonly _adminService: IAdminService
  ) { }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = (req.query.search as string) || '';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { users, total } =
        await this._adminService.getAllUsers(search, page, limit);

      return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });

    } catch (error) {
      next(error);
    }
  };

  updateUserBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { isBlocked } = req.body;

      if (!userId) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, ADMIN_MESSAGES.USER_ID_REQUIRED);
      }

      if (typeof isBlocked !== 'boolean') {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, ADMIN_MESSAGES.IS_BLOCKED_MUST_BE_BOOLEAN);
      }

      await this._adminService.updateUserBlockStatus(userId, isBlocked);

      return sendResponse(res, HTTP_STATUS.OK, isBlocked ? COMMON_MESSAGES.USER_BLOCKED : COMMON_MESSAGES.USER_UNBLOCKED);

    } catch (error) {
      next(error);
    }
  };

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query;

      const toDate = to ? new Date(to as string) : new Date();
      const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      toDate.setHours(23, 59, 59, 999);
      fromDate.setHours(0, 0, 0, 0);

      const stats = await this._adminService.getDashboardStats(fromDate, toDate);

      return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, stats);
    } catch (error) {
      next(error);
    }
  };
}
