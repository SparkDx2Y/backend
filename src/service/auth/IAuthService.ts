



export interface IAuthService {

    signup(email: string, password: string): Promise<void>;

    verifyUser(email: string, otp: string): Promise<boolean>;

    resendOtp(email: string): Promise<void>;

    login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }>;


  }
  