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
            const users = await this._adminService.getAllUsers();

            return res.status(HTTP_STATUS.OK).json({
                message: "Users retrieved successfully",
                users: users
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

            const user = await this._adminService.updateUserBlockStatus(userId, isBlocked);

            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    message: "User not found"
                });
            }

            return res.status(HTTP_STATUS.OK).json({
                message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isBlocked: user.isBlocked
                }
            });

        } catch (error) {
            next(error);
        }
    };
}

