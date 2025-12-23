import { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthController } from "../controllers/auth/AuthController";
import { ProfileController } from "../controllers/profile/ProfileController";


export function bindControllers(container: Container) {
    container.bind(DI_TYPES.CONTROLLERS.AUTH_CONTROLLER).to(AuthController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.PROFILE_CONTROLLER).to(ProfileController).inSingletonScope()
}