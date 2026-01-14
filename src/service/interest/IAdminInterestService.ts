import { InterestCategoryResponseDto } from "../../dto/response/interest/interest-category.response.dto";
import { InterestResponseDto } from "../../dto/response/interest/interest.response.dto";


export interface IAdminInterestService {

    createCategory(name: string): Promise<InterestCategoryResponseDto>;

    getAllCategories(): Promise<InterestCategoryResponseDto[]>;

    updateCategory(id: string, name: string): Promise<InterestCategoryResponseDto>;

    setCategoryActive(categoryId: string, isActive: boolean): Promise<InterestCategoryResponseDto>;

    // Create Interest

    createInterest(name: string, categoryId: string): Promise<InterestResponseDto>;

    getAllInterests(): Promise<InterestResponseDto[]>;



    updateInterest(id: string, name: string): Promise<InterestResponseDto>;

    setInterestActive(interestId: string, isActive: boolean): Promise<InterestResponseDto>;
}