import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IMatchService } from "../../service/match/IMatchService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";

@injectable()
export class MatchController {
    constructor(
        @inject(DI_TYPES.SERVICES.MATCH_SERVICE) private readonly _matchService: IMatchService
    ) { }

    // GET /match/feed
    getFeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }
            const profiles = await this._matchService.getPotentialMatches(req.user.id);
            res.status(HTTP_STATUS.OK).json(profiles);
        } catch (error) {
            next(error);
        }
    };

    // POST /match/action
    action = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const { targetId, action } = req.body;

            if (!targetId || !['like', 'pass'].includes(action)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid action payload" });
            }

            const result = await this._matchService.swipe(req.user.id, targetId, action);
            res.status(HTTP_STATUS.OK).json(result);

        } catch (error) {
            next(error);
        }
    };
}
