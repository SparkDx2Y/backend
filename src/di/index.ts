import { Container } from "inversify";
import { bindServices } from "./service.bindings";
import { bindRepositories } from "./repository.bindings";
import { DI_TYPES } from "./types";
import redis from "../config/redisConfig";
const container = new Container({defaultScope: 'Singleton'});


//? register bindings
container.bind(DI_TYPES.External.REDIS).toConstantValue(redis)

bindRepositories(container);
bindServices(container);


export default container       