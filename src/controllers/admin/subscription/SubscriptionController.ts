import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../../constants/common.messages";
import { DI_TYPES } from "../../../di/types";
import { ISubscriptionService } from "../../../service/subscription/ISubscriptionService";
import { HTTP_STATUS } from "../../../constants/http-status.constants";
import { createPlanSchema, idParamSchema, updatePlanSchema } from "../../../dto/request/subscription/admin-subscription.dto";
import { SUBSCRIPTION_MESSAGES } from "../../../constants/subscription/subscription.messages";

@injectable()
export class SubscriptionController {
    constructor(
        @inject(DI_TYPES.SERVICES.SUBSCRIPTION_SERVICE) private readonly _subscriptionService: ISubscriptionService
    ) { }

    createPlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createPlanSchema.parse(req.body);
            const plan = await this._subscriptionService.createPlan(data as Parameters<ISubscriptionService['createPlan']>[0]);
            return sendResponse(res, HTTP_STATUS.CREATED, SUBSCRIPTION_MESSAGES.CREATED, plan);
        } catch (error) {
            next(error);
        }
    }

    updatePlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = updatePlanSchema.parse(req.body);
            const plan = await this._subscriptionService.updatePlan(id, data as Parameters<ISubscriptionService['updatePlan']>[1]);
            return sendResponse(res, HTTP_STATUS.OK, SUBSCRIPTION_MESSAGES.UPDATED, plan);
        } catch (error) {
            next(error);
        }
    }

    getAllPlans = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const result = await this._subscriptionService.getAllPlans(page, limit);
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, result);
        } catch (error) {
            next(error);
        }
    }

    getPlanById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const plan = await this._subscriptionService.getPlanById(id);
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, plan);
        } catch (error) {
            next(error);
        }
    }

    togglePlanStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const plan = await this._subscriptionService.togglePlanStatus(id);
            return sendResponse(res, HTTP_STATUS.OK, SUBSCRIPTION_MESSAGES.STATUS_TOGGLED, plan);
        } catch (error) {
            next(error);
        }
    }
}
