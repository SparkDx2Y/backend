import { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthController } from "../controllers/auth/AuthController";
import { ProfileController } from "../controllers/profile/ProfileController";
import { FileController } from "../controllers/file/FileController";


export function bindControllers(container: Container) {
    container.bind(DI_TYPES.CONTROLLERS.AUTH_CONTROLLER).to(AuthController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.PROFILE_CONTROLLER).to(ProfileController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.FILE_CONTROLLER).to(FileController).inSingletonScope()
}