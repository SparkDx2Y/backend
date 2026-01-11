import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IMatchService } from "../../service/match/IMatchService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { swipeActionSchema } from "../../dto/request/match/swipe-action.dto";

@injectable()
export class MatchController {
    constructor(
        @inject(DI_TYPES.SERVICES.MATCH_SERVICE) private readonly _matchService: IMatchService
    ) { }

   //? Get potential matches for a user (Feed)
    getFeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            //? Auth check
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }
            
            //? Get potential matches
            const profiles = await this._matchService.getDiscoverProfiles(req.user.id);
            res.status(HTTP_STATUS.OK).json(profiles);
        } catch (error) {
            next(error);
        }
    };

    //? Perform a swipe action (Swipe)
    swipe = async (req: Request, res: Response, next: NextFunction) => {
        
        try {

            //? Auth check
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const { targetId, action } = swipeActionSchema.parse(req.body);

            const result = await this._matchService.swipe(req.user.id, targetId, action);
            res.status(HTTP_STATUS.OK).json(result);

        } catch (error) {
            next(error);
        }
    };
}
