import { inject, injectable } from "inversify";
import type { IPaymentService } from "./IPaymentService";
import { DI_TYPES } from "../../di/types";
import type { ISubscriptionRepository } from "../../repositories/subscription/ISubscriptionRepository";
import type { IUserSubscriptionRepository } from "../../repositories/subscription/IUserSubscriptionRepository";
import Stripe from "stripe";
import { STRIPE_CONFIG } from "../../config/stripeConfig";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import type { IUserSubscription } from "../../models/user-subscription";
import logger from "../../config/logger";

@injectable()
export class PaymentService implements IPaymentService {
    private stripe: Stripe;

    constructor(
        @inject(DI_TYPES.REPOSITORIES.SUBSCRIPTION_REPOSITORY)
        private readonly _subscriptionRepo: ISubscriptionRepository,
        @inject(DI_TYPES.REPOSITORIES.USER_SUBSCRIPTION_REPOSITORY)
        private readonly _userSubscriptionRepo: IUserSubscriptionRepository
    ) {
        this.stripe = new Stripe(STRIPE_CONFIG.SECRET_KEY, {
            apiVersion: "2026-02-25.clover"
        });
    }

    async createCheckoutSession(userId: string, planId: string): Promise<string> {
        const plan = await this._subscriptionRepo.findById(planId.toString());

        if (!plan) {
            throw new AppError("Subscription plan not found", HTTP_STATUS.NOT_FOUND);
        }

        if (!plan.isActive) {
            throw new AppError("This plan is no longer available", HTTP_STATUS.BAD_REQUEST);
        }


        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `${plan.name}`,
                            description: `Spark Premium ${plan.durationValue} ${plan.durationUnit}(s) access`,
                        },
                        unit_amount: Math.round(plan.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: STRIPE_CONFIG.SUCCESS_URL,
            cancel_url: STRIPE_CONFIG.CANCEL_URL,
            metadata: {
                userId: userId.toString(),
                planId: planId.toString(),
                durationValue: plan.durationValue.toString(),
                durationUnit: plan.durationUnit.toString(),
            },
        });

        if (!session.url) {
            throw new AppError("Failed to create checkout session", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return session.url;
    }

    async handleWebhook(rawBody: string | Buffer, signature: string): Promise<void> {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                STRIPE_CONFIG.WEBHOOK_SECRET
            );
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            throw new AppError(`Webhook Error: ${errorMessage}`, HTTP_STATUS.BAD_REQUEST);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await this.processSuccessfulPayment(session);
        }
    }

    private async processSuccessfulPayment(session: Stripe.Checkout.Session) {
        const { userId, planId, durationValue, durationUnit } = session.metadata || {};

        if (!userId || !planId || !durationValue || !durationUnit) {
            logger.error("Missing metadata in successful Stripe session");
            return;
        }


        const startDate = new Date();
        const endDate = new Date(startDate);

        const value = parseInt(durationValue);
        if (durationUnit === 'month') {
            endDate.setMonth(endDate.getMonth() + value);
        } else if (durationUnit === 'year') {
            endDate.setFullYear(endDate.getFullYear() + value);
        }


        const existingActive = await this._userSubscriptionRepo.findActiveByUserId(userId);
        if (existingActive) {
            await this._userSubscriptionRepo.updateById(existingActive._id.toString(), {
                status: "UPGRADED"
            });
        }


        await this._userSubscriptionRepo.create({
            userId: userId,
            planId: planId,
            startDate,
            endDate,
            amountPaid: session.amount_total ? session.amount_total / 100 : 0,
            status: "ACTIVE"
        } as unknown as Partial<IUserSubscription>);
    }
}
