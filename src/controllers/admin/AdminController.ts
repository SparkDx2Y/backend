import { Request, Response, NextFunction } from "express";
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
        
            return res.status(HTTP_STATUS.OK).json({
              message: "Users fetched successfully",
              data: {
                users,
                pagination: {
                  page,
                  limit,
                  total,
                  totalPages: Math.ceil(total / limit)
                }
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
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "User ID is required"
                });
            }

            if (typeof isBlocked !== 'boolean') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "isBlocked must be a boolean value"
                });
            }

            await this._adminService.updateUserBlockStatus(userId, isBlocked);

            return res.status(HTTP_STATUS.OK).json({
                message: isBlocked ? "User blocked successfully" : "User unblocked successfully"
            });

        } catch (error) {
            next(error);
        }
    };
}

