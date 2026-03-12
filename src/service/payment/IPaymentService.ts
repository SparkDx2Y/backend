export interface IPaymentService {
    createCheckoutSession(userId: string, planId: string): Promise<string>;
    handleWebhook(rawBody: string | Buffer, signature: string): Promise<void>;
}
