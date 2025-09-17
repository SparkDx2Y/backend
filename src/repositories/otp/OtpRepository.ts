import { inject, injectable } from "inversify";
import { IOtpRepository } from "./IOtpRepository";
import { DI_TYPES } from "../../di/types";
import Redis from "ioredis";



@injectable()
export class OtpRepository implements IOtpRepository {
    private readonly keyPre: string = 'Otp';

    constructor(
        @inject(DI_TYPES.External.REDIS)
        private readonly redis: Redis
    ) {}

    private getKey(email: string): string {
        return `${this.keyPre}${email}`;
    }

    async saveOtp(email: string, otp: string, expiresIn: number = 300): Promise<void> {
        const key = this.getKey(email)
        await this.redis.set(key, otp, 'EX', expiresIn)
    }

    async getOtp(email: string): Promise<string | null> {
        const key = this.getKey(email)
        return await this.redis.get(key)
    }

    async deleteOtp(email: string): Promise<void> {
        const key = this.getKey(email)
        await this.redis.del(key)
    }

    async otpExists(email: string): Promise<boolean> {
        const key = this.getKey(email)
        const exists = await this.redis.exists(key)
        return exists === 1
    }
}