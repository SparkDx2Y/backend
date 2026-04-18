import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IMatchService } from "../../service/match/IMatchService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { MATCH_ERRORS } from "../../constants/errors/match.errors";
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
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            //? Get potential matches
            const profiles = await this._matchService.getDiscoverProfiles(req.user.id);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FEED_FETCHED, profiles);
        } catch (error) {
            next(error);
        }
    };

    //? Perform a swipe action (Swipe)
    swipe = async (req: Request, res: Response, next: NextFunction) => {

        try {

            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const { targetId, action } = swipeActionSchema.parse(req.body);

            const result = await this._matchService.swipe(req.user.id, targetId, action);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.SWIPE_SUCCESSFUL, result);

        } catch (error) {
            next(error);
        }
    };

    getActivity = async (req: Request, res: Response, next: NextFunction) => {
        try {

            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const data = await this._matchService.getActivity(req.user.id);

            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.ACTIVITY_FETCHED, data);

        } catch (error) {
            next(error);
        }
    };

    suggestDateSpots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const { matchId } = req.params;
            const type = req.query.type as string | undefined;
            if (!matchId) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, MATCH_ERRORS.MATCH_ID_REQUIRED);
            }

            const suggestions = await this._matchService.suggestDateSpots(req.user.id, matchId as string, type);

            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.DATE_SUGGESTIONS_FETCHED, suggestions);
        } catch (error) {
            next(error);
        }
    };

}
