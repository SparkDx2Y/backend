import { Container } from "inversify";
import { DI_TYPES } from "./types";

 
//? repositories
import { UserRepository } from '../repositories/user/UserRepository'
import { OtpRepository } from "../repositories/otp/OtpRepository";

export function bindRepositories(container: Container) {
    container.bind(DI_TYPES.REPOSITORIES.USER_REPOSITORY).to(UserRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.OTP_REPOSITORY).to(OtpRepository).inSingletonScope()
}