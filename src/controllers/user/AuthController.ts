import { signupSchema, loginSchema, verifyOtpSchema } from "../../dto/Auth.dto";
import { AuthService } from "../../services/AuthService";
import { Request, Response } from "express";
import { z } from 'zod'


export class AuthController {
  constructor(private authService: AuthService){}

  signup = async (req: Request, res: Response) => {
    try {
      const data = signupSchema.parse(req.body);
      const user = await this.authService.signup(data.email, data.password);
      res.status(201).json({ user });
    } catch (error: any) {
      console.error("Error during signup:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "An error occurred during signup." });
      }
    }
  }

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const data = verifyOtpSchema.parse(req.body);
      const result = await this.authService.verifyOtp(data.userId, data.otp);
      res.status(200).json(result);
    } catch (err: any) {
      console.error("Error during OTP verification:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ errors: err.errors });
      } else {
        res.status(500).json({ message: "An error occurred during verifyOtp." });
      }
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await this.authService.login(data.email, data.password);
  
      res
      .cookie('jwt', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }) 
      .status(200)
      .json({ accessToken, refreshToken, user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await this.authService.resendOtp(email);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('resend otp failed', error); 
      res.status(500).json({ message: "An error occurred while resending OTP." });
    }
  }
  

  logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie('jwt');
      res.clearCookie('refreshToken');
      res.status(200).json({ message: "Logged out successfully" });

    } catch (err: any) {
      console.error("Error during logout:", err);
      res.status(500).json({ message: "An error occurred during logout." });
    }
  }
  
  
}