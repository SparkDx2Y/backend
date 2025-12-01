// import { inject, injectable } from "inversify";
// import { IAuthService } from "./IAuthService";
// import { DI_TYPES } from "../../di/types";
// import { IUserRepository } from "../../repositories/user/IUserRepository";
// import { IOtpRepository } from "../../repositories/otp/IOtpRepository";
// import { comparePassword, hashPassword } from "../../utils/password";
// import { generateOTP } from "../../utils/otp";
// import { sendOtpEmail } from "../../utils/sendEmail";
// import { generateRefreshToken, generateToken } from "../../utils/jwtHelper";




// @injectable()
// export class AuthService implements IAuthService {

//     constructor(
//         @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY) private _userRepo: IUserRepository,
//         @inject(DI_TYPES.REPOSITORIES.OTP_REPOSITORY) private _otpRepo: IOtpRepository
//     ) {}


//     // * SignUp //

//     async signup(email: string, password: string): Promise<void> {
        
//         try {

//             const existingUser = await this._userRepo.findByEmail(email);
            
//             if (existingUser) {
//                 throw new Error('User already exists')
//             }

//             const hashedPassword = await hashPassword(password)

//             await this._userRepo.create({
//                 email,
//                 password: hashedPassword
//             })

//             const otp = generateOTP()
//             await this._otpRepo.saveOtp(email, otp, 300);
//             await sendOtpEmail(email, otp)

//         } catch (err) {
//             console.error('signup Error', err)
//             throw err;
//         }
//     }


//     //* verify User or otp //

//     async verifyUser(email: string, otp: string): Promise<boolean> {
        
//         try {
//             const storedOtp = await this._otpRepo.getOtp(email);

//             if(!storedOtp || storedOtp !== otp) return false;

//             const user = await this._userRepo.findByEmail(email);
//             if(!user) {
//                 throw new Error("User not found");
//             }

//             await this._userRepo.markVerified(String(user._id))
//             await this._otpRepo.deleteOtp(email)
//             return true

//         } catch (err) {
//             console.error('verify User Error', err)
//             throw err
//         }
//     }



//     //* resend Otp //
    
//     async resendOtp(email: string): Promise<void> {
//         try {

//             const user = await this._userRepo.findByEmail(email);
//             if(!user) {
//                 throw new Error('User not found')
//             }

//             const otp = generateOTP();
//       await this._otpRepo.saveOtp(email, otp, 300); 
//       await sendOtpEmail(email,otp);

//         } catch  (err) {
//             console.error('Resend Otp Error', err)
//             throw err;
//         }
//     }


//     //* Login //

//     async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; }> {
//         try {

//             const user = await this._userRepo.findByEmail(email)

//             if(!user) {
//                 throw new Error('User not Found');
//             }
//             if(!user.isVerified) {
//                 throw new Error('User is not verified')
//             }

//             const isMatch = await comparePassword(password, user.password)

//             if(!isMatch) {
//                 throw new Error('Invalid credentials')
//             } 

//             const payload = { id: user._id }

//             return  {
//                 accessToken: generateToken(payload),
//                 refreshToken: generateRefreshToken(payload)
//             }

//         } catch (err) {
//             console.error('Login Error', err)
//             throw err;
//         }
//     }



// }



