import { IInterest } from "../../models/interest";
import { InterestResponseDto } from "../../dto/response/interest/interest.response.dto";

export class InterestMapper {
    static toInterestResponseDto(interest: any): InterestResponseDto {
        const dto: InterestResponseDto = {
            id: interest._id.toString(),
            name: interest.name,
            categoryId: interest.categoryId?._id ? interest.categoryId._id.toString() : (interest.categoryId?.toString() || ''),
            isActive: interest.isActive
        };

        if (interest.categoryId && typeof interest.categoryId === 'object' && interest.categoryId.name) {
            dto.category = {
                id: interest.categoryId._id.toString(),
                name: interest.categoryId.name
            };
        }

        return dto;
    }

    static toInterestResponseDtoList(interests: IInterest[]): InterestResponseDto[] {
        return interests.map(this.toInterestResponseDto);
    }
}
