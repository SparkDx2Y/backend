import { inject, injectable } from "inversify";
import { IOtpRepository } from "./IOtpRepository";
import { DI_TYPES } from "../../di/types";
import Redis from "ioredis";



@injectable()
export class OtpRepository implements IOtpRepository {
    private readonly keyPrefix: string = 'Otp:';

    constructor(
        @inject(DI_TYPES.External.REDIS)
        private readonly redis: Redis
    ) {}

    private getKey(userId: string): string {
        return `${this.keyPrefix}${userId}`;
    }

    async saveOtp(userId: string, otp: string, expiresIn: number = 300): Promise<void> {
        const key = this.getKey(userId)
        await this.redis.set(key, otp, 'EX', expiresIn)
    }

    async getOtp(userId: string): Promise<string | null> {
        const key = this.getKey(userId)
        return await this.redis.get(key)
    }

    async deleteOtp(userId: string): Promise<void> {
        const key = this.getKey(userId)
        await this.redis.del(key)
    }

    async otpExists(userId: string): Promise<boolean> {
        const key = this.getKey(userId)
        const exists = await this.redis.exists(key)
        return exists === 1
    }
}