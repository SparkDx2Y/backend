import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IAdminService } from "../../service/admin/IAdminService";
import { HTTP_STATUS } from "../../constants/http-status.constants";

@injectable()
export class AdminController {

  constructor(
    @inject(DI_TYPES.SERVICES.ADMIN_SERVICE)
    private readonly _adminService: IAdminService
  ) { }

  // ----------------------------------
  // Get all users (admin only)
  // ----------------------------------
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = (req.query.search as string) || '';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { users, total } =
        await this._adminService.getAllUsers(
          search,
          page,
          limit
        );



      return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------
  // Update user block status (admin only)
  // ----------------------------------
  updateUserBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { isBlocked } = req.body;

      if (!userId) {

        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "User ID is required");
      }

      if (typeof isBlocked !== 'boolean') {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "isBlocked must be a boolean value");
      }

      await this._adminService.updateUserBlockStatus(userId, isBlocked);

      return sendResponse(res, HTTP_STATUS.OK, isBlocked ? COMMON_MESSAGES.USER_BLOCKED : COMMON_MESSAGES.USER_UNBLOCKED);

    } catch (error) {
      next(error);
    }
  };
}

