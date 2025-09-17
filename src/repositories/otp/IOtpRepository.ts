

export interface IOtpRepository {

    saveOtp(email: string, otp: string, expiresIn?: number): Promise<void>;

    getOtp(email: string): Promise<string | null>;

    deleteOtp(email: string): Promise<void>;
    
    otpExists(email: string): Promise<boolean>

}