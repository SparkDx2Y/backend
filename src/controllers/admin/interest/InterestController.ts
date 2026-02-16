import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../../constants/common.messages";
import { DI_TYPES } from "../../../di/types";
import { IInterestService } from "../../../service/interest/IInterestService";
import { createCategorySchema, createInterestSchema, idParamSchema, setActiveSchema, updateCategorySchema, updateInterestSchema } from "../../../dto/request/interest/admin-interest.dto";
import { HTTP_STATUS } from "../../../constants/http-status.constants";



@injectable()
export class InterestController {

    constructor(
        @inject(DI_TYPES.SERVICES.INTEREST_SERVICE) private readonly _adminInterestService: IInterestService
    ) { }


    // =====================
    // CATEGORY
    // =====================

    createCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const data = createCategorySchema.parse(req.body);

            const Category = await this._adminInterestService.createCategory(data.name)

            return sendResponse(res, HTTP_STATUS.CREATED, COMMON_MESSAGES.CATEGORY_CREATED, Category);
        } catch (error) {
            next(error);
        }
    }

    getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const Category = await this._adminInterestService.getAllCategories();

            
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, Category);
        } catch (error) {
            next(error);
        }
    }

    updateCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = updateCategorySchema.parse(req.body);

            const Category = await this._adminInterestService.updateCategory(id, data.name);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.CATEGORY_UPDATED, Category);
        } catch (error) {
            next(error);
        }
    }

    setActiveCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = setActiveSchema.parse(req.body);

            const Category = await this._adminInterestService.setCategoryActive(id, data.isActive);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.CATEGORY_UPDATED, Category);
        } catch (error) {
            next(error);
        }
    }

    // =====================
    // INTEREST
    // =====================

    createInterest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createInterestSchema.parse(req.body);

            const interest = await this._adminInterestService.createInterest(data.name, data.categoryId);


            return sendResponse(res, HTTP_STATUS.CREATED, COMMON_MESSAGES.INTEREST_CREATED, interest);
        } catch (error) {
            next(error);
        }
    }

    getAllInterests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const interest = await this._adminInterestService.getAllInterests();


            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, interest);
        } catch (error) {
            next(error);
        }
    }

    updateInterest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = updateInterestSchema.parse(req.body);

            const interest = await this._adminInterestService.updateInterest(id, data.name);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.INTEREST_UPDATED, interest);
        } catch (error) {
            next(error);
        }
    }

    setActiveInterest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = setActiveSchema.parse(req.body);

            const interest = await this._adminInterestService.setInterestActive(id, data.isActive);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.INTEREST_UPDATED, interest);
        } catch (error) {
            next(error);
        }
    }



}