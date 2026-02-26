import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { DI_TYPES } from "../../di/types";
import { ISubscriptionService } from "../../service/subscription/ISubscriptionService";
import { HTTP_STATUS } from "../../constants/http-status.constants";

@injectable()
export class UserSubscriptionController {
    constructor(
        @inject(DI_TYPES.SERVICES.SUBSCRIPTION_SERVICE) private readonly _subscriptionService: ISubscriptionService
    ) { }

    getActivePlans = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const plans = await this._subscriptionService.getActivePlans();
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, plans);
        } catch (error) {
            next(error);
        }
    }
}
