import { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthService } from "../service/auth/AuthService";


export function bindServices(container: Container) {
    container.bind(DI_TYPES.SERVICES.AUTH_SERVICE).to(AuthService).inSingletonScope()
}