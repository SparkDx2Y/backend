import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IPaymentService } from "../../service/payment/IPaymentService";
import { sendResponse } from "../../utils/responseHelper";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { PAYMENT_MESSAGES, PAYMENT_ERRORS } from "../../constants/payment.constants";

@injectable()
export class PaymentController {
    constructor(
        @inject(DI_TYPES.SERVICES.PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService
    ) { }

    createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, PAYMENT_ERRORS.UNAUTHORIZED);
            }

            const { planId } = req.body;
            if (!planId) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, PAYMENT_ERRORS.PLAN_ID_REQUIRED);
            }

            const url = await this._paymentService.createCheckoutSession(req.user.id, planId);

            sendResponse(res, HTTP_STATUS.CREATED, PAYMENT_MESSAGES.CHECKOUT_SESSION_CREATED, { url });
        } catch (error) {
            next(error);
        }
    };

    handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signature = req.headers["stripe-signature"];

            if (!signature) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, PAYMENT_ERRORS.MISSING_STRIPE_SIGNATURE);
            }

            const sigStr = (Array.isArray(signature) ? signature[0] : signature) as string;

            await this._paymentService.handleWebhook(req.body, sigStr);

            sendResponse(res, HTTP_STATUS.OK, PAYMENT_MESSAGES.WEBHOOK_RECEIVED, { received: true });
        } catch (error) {
            next(error);
        }
    };
}
