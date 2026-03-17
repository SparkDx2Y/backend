import { inject, injectable } from "inversify";
import { IInterestService } from "./IInterestService";
import { DI_TYPES } from "../../di/types";
import { IInterestCategoryRepository } from "../../repositories/interest/IInterestCategoryRepository";
import { IInterestRepository } from "../../repositories/interest/IInterestRepository";
import { InterestCategoryResponseDto } from "../../dto/response/interest/interest-category.response.dto";
import { InterestCategoryMapper } from "../../mapper/interest/interest-category.mapper";
import { InterestMapper } from "../../mapper/interest/interest.mapper";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { INTEREST_ERRORS } from "../../constants/errors/interest.errors";
import { AppError } from "../../utils/AppError";
import { InterestResponseDto } from "../../dto/response/interest/interest.response.dto";



@injectable()
export class InterestService implements IInterestService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.INTEREST_CATEGORY_REPOSITORY) private readonly _categoryRepo: IInterestCategoryRepository,
        @inject(DI_TYPES.REPOSITORIES.INTEREST_REPOSITORY) private readonly _interestRepo: IInterestRepository
    ) { }


    //* ----------------------------------
    // Create Category
    //* ----------------------------------

    async createCategory(name: string): Promise<InterestCategoryResponseDto> {

        const existingCategory = await this._categoryRepo.findByName(name);

        if (existingCategory) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_ALREADY_EXISTS,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const newCategory = await this._categoryRepo.create({ name });

        return InterestCategoryMapper.toInterestCategoryResponseDto(newCategory);
    }

    //* ----------------------------------
    // Get All Categories
    //* ----------------------------------

    async getAllCategories(): Promise<InterestCategoryResponseDto[]> {
        const categories = await this._categoryRepo.find();
        return categories.map(InterestCategoryMapper.toInterestCategoryResponseDto);
    }

    //* ----------------------------------
    // Update Category
    //* ----------------------------------

    async updateCategory(id: string, name: string): Promise<InterestCategoryResponseDto> {
        const existingCategory = await this._categoryRepo.findById(id);

        if (!existingCategory) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            )
        }

        const updatedCategory = await this._categoryRepo.updateById(id, { name });

        if (!updatedCategory) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_UPDATE_FAILED,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            )
        }

        return InterestCategoryMapper.toInterestCategoryResponseDto(updatedCategory);
    }

    //* ----------------------------------
    // Set Category Active
    //* ----------------------------------

    async setCategoryActive(categoryId: string, isActive: boolean): Promise<InterestCategoryResponseDto> {
        const existingCategory = await this._categoryRepo.findById(categoryId);

        if (!existingCategory) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            )
        }

        const updatedCategory = await this._categoryRepo.setActive(categoryId, isActive);

        if (!updatedCategory) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_UPDATE_FAILED,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            )
        }

        return InterestCategoryMapper.toInterestCategoryResponseDto(updatedCategory);
    }


    // ===================
    // Interests
    // ===================


    //* ----------------------------------
    // Create Interest
    //* ----------------------------------

    async createInterest(name: string, categoryId: string): Promise<InterestResponseDto> {
        const existingInterest = await this._interestRepo.findByName(name);

        if (existingInterest) {
            throw new AppError(
                INTEREST_ERRORS.INTEREST_ALREADY_EXISTS,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const existingCategory = await this._categoryRepo.findById(categoryId);

        if (!existingCategory) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            )
        }

        if (!existingCategory.isActive) {
            throw new AppError(
                INTEREST_ERRORS.CATEGORY_INACTIVE,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const newInterest = await this._interestRepo.createInterest(name, categoryId);

        return InterestMapper.toInterestResponseDto(newInterest);
    }

    //* ----------------------------------
    // Update Interest
    //* ----------------------------------

    async updateInterest(interestId: string, name: string): Promise<InterestResponseDto> {
        const existingInterest = await this._interestRepo.findById(interestId);

        if (!existingInterest) {
            throw new AppError(
                INTEREST_ERRORS.INTEREST_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            )
        }

        const updatedInterest = await this._interestRepo.updateById(interestId, { name });

        if (!updatedInterest) {
            throw new AppError(
                INTEREST_ERRORS.INTEREST_UPDATE_FAILED,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            )
        }

        return InterestMapper.toInterestResponseDto(updatedInterest);
    }

    //* ----------------------------------
    // Set Interest Active
    //* ----------------------------------  

    async setInterestActive(interestId: string, isActive: boolean): Promise<InterestResponseDto> {

        const existingInterest = await this._interestRepo.findById(interestId);

        if (!existingInterest) {
            throw new AppError(
                INTEREST_ERRORS.INTEREST_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            )
        }

        const updatedInterest = await this._interestRepo.setActive(interestId, isActive);

        if (!updatedInterest) {
            throw new AppError(
                INTEREST_ERRORS.INTEREST_UPDATE_FAILED,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            )
        }

        return InterestMapper.toInterestResponseDto(updatedInterest);
    }


    //* ----------------------------------
    // Get All Interests
    //* ----------------------------------

    async getAllInterests(): Promise<InterestResponseDto[]> {
        const interests = await this._interestRepo.findAll();
        return interests.map(InterestMapper.toInterestResponseDto);
    }


    //* ----------------------------------
    // Get Active Interests
    //* ----------------------------------

    async getActiveInterests(): Promise<InterestResponseDto[]> {
        const interests = await this._interestRepo.findAll();


        const activeInterests = interests.filter(i =>
            i.isActive &&
            i.categoryId.isActive !== false
        );

        return activeInterests.map(InterestMapper.toInterestResponseDto);
    }

}