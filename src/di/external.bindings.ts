import { Container } from "inversify";
import { OAuth2Client } from "google-auth-library";
import { googleConfig } from "../config/google.config";
import redis from "../config/redisConfig";
import { DI_TYPES } from "./types";

export function bindExternalDependencies(container: Container) {
    container.bind(DI_TYPES.External.REDIS).toConstantValue(redis);

    const googleClient = new OAuth2Client(googleConfig.clientId);

    container.bind<OAuth2Client>(DI_TYPES.External.GOOGLE_CLIENT).toConstantValue(googleClient);
}
