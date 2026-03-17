import type { IInterest, IInterestPopulated } from "../../models/interest";
import type { InterestResponseDto } from "../../dto/response/interest/interest.response.dto";
import type { IInterestCategory } from "../../models/interest-category";

export class InterestMapper {
    static toInterestResponseDto(interest: IInterestPopulated | IInterest): InterestResponseDto {
        const category = interest.categoryId as unknown as IInterestCategory | undefined;

        const dto: InterestResponseDto = {
            id: interest._id.toString(),
            name: interest.name,
            categoryId: category?._id ? category._id.toString() : (interest.categoryId?.toString() || ''),
            isActive: interest.isActive
        };

        if (category && typeof category === 'object' && category.name) {
            dto.category = {
                id: category._id.toString(),
                name: category.name
            };
        }

        return dto;
    }

    static toInterestResponseDtoList(interests: (IInterestPopulated | IInterest)[]): InterestResponseDto[] {
        return interests.map(interest => this.toInterestResponseDto(interest));
    }
}
