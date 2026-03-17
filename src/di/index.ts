import { Container } from "inversify";
import { bindServices } from "./service.bindings";
import { bindRepositories } from "./repository.bindings";
import { bindExternalDependencies } from "./external.bindings";
import { bindControllers } from "./controller.bindings";

const container = new Container({ defaultScope: 'Singleton' });

//? register bindings
bindExternalDependencies(container);
bindRepositories(container);
bindServices(container);
bindControllers(container);

export default container       