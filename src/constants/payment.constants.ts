export const PAYMENT_MESSAGES = {
    CHECKOUT_SESSION_CREATED: "Checkout session created",
    WEBHOOK_RECEIVED: "Webhook received",
} as const;

export const PAYMENT_ERRORS = {
    UNAUTHORIZED: "Unauthorized",
    PLAN_ID_REQUIRED: "Plan ID is required",
    MISSING_STRIPE_SIGNATURE: "Missing Stripe signature",
    WEBHOOK_ERROR: "Webhook Error",
} as const;
