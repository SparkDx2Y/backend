import type http from "http";
import container from "../di";
import { DI_TYPES } from "../di/types";
import { SocketServer } from "./SocketServer";
import type { SocketServiceWrapper } from "../service/socket/SocketServiceWrapper";
import type { IMatchedUsersRepository } from "../repositories/match/IMatchedUsersRepository";
import type { IMessageRepository } from "../repositories/message/IMessageRepository";


// ========
// Initialize Socket.IO
// ========
export const initSocket = (httpServer: http.Server) => {
    const matchedUsersRepo = container.get<IMatchedUsersRepository>(
        DI_TYPES.REPOSITORIES.MATCHED_USERS_REPOSITORY
    );

    const messageRepo = container.get<IMessageRepository>(
        DI_TYPES.REPOSITORIES.MESSAGE_REPOSITORY
    );

    const socketServer = new SocketServer(httpServer, matchedUsersRepo, messageRepo);

    const socketServiceWrapper = container.get<SocketServiceWrapper>(
        DI_TYPES.SERVICES.SOCKET_SERVICE
    );

    socketServiceWrapper.initialize(socketServer);

    return socketServer;
};
