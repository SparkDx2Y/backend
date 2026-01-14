import { IInterestCategory } from "../../models/interest-category";
import { InterestCategoryResponseDto } from "../../dto/response/interest/interest-category.response.dto";

export class InterestCategoryMapper {
    static toInterestCategoryResponseDto(category: IInterestCategory): InterestCategoryResponseDto {
        return {
            id: category._id.toString(),
            name: category.name,
            isActive: category.isActive
        };
    }
}
