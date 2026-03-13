import dotenv from "dotenv";

dotenv.config();

export const STRIPE_CONFIG = {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    SUCCESS_URL: `${process.env.FRONTEND_URL}/user/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    CANCEL_URL: `${process.env.FRONTEND_URL}/user/premium`,
};
