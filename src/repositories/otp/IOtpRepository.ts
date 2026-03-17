

export interface IOtpRepository {

    saveOtp(userId: string, otp: string, expiresIn?: number): Promise<void>;

    getOtp(userId: string): Promise<string | null>;

    deleteOtp(userId: string): Promise<void>;
    
    otpExists(userId: string): Promise<boolean>

}