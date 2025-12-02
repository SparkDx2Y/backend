import { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthController } from "../controllers/auth/AuthController";


export function bindControllers(container: Container) {
    container.bind(DI_TYPES.CONTROLLERS.AUTH_CONTROLLER).to(AuthController).inSingletonScope()
}