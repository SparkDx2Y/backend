import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
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

            return res.status(HTTP_STATUS.CREATED).json({
                message: "Category created successfully",
                data: Category
            });
        } catch (error) {
            next(error);
        }
    }

    getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const Category = await this._adminInterestService.getAllCategories();

            return res.status(HTTP_STATUS.OK).json({
                message: "Categories fetched successfully",
                data: Category
            });
        } catch (error) {
            next(error);
        }
    }

    updateCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = updateCategorySchema.parse(req.body);

            const Category = await this._adminInterestService.updateCategory(id, data.name);

            return res.status(HTTP_STATUS.OK).json({
                message: "Category updated successfully",
                data: Category
            });
        } catch (error) {
            next(error);
        }
    }

    setActiveCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = setActiveSchema.parse(req.body);

            const Category = await this._adminInterestService.setCategoryActive(id, data.isActive);

            return res.status(HTTP_STATUS.OK).json({
                message: "Category updated successfully",
                data: Category
            });
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

            return res.status(HTTP_STATUS.CREATED).json({
                message: "Interest created successfully",
                data: interest
            });
        } catch (error) {
            next(error);
        }
    }

    getAllInterests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const interest = await this._adminInterestService.getAllInterests();

            return res.status(HTTP_STATUS.OK).json({
                message: "Interests fetched successfully",
                data: interest
            });
        } catch (error) {
            next(error);
        }
    }

    updateInterest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = updateInterestSchema.parse(req.body);

            const interest = await this._adminInterestService.updateInterest(id, data.name);

            return res.status(HTTP_STATUS.OK).json({
                message: "Interest updated successfully",
                data: interest
            });
        } catch (error) {
            next(error);
        }
    }

    setActiveInterest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = idParamSchema.parse(req.params);
            const data = setActiveSchema.parse(req.body);

            const interest = await this._adminInterestService.setInterestActive(id, data.isActive);

            return res.status(HTTP_STATUS.OK).json({
                message: "Interest updated successfully",
                data: interest
            });
        } catch (error) {
            next(error);
        }
    }



}