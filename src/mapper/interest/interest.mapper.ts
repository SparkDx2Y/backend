import { IInterest } from "../../models/interest";
import { InterestResponseDto } from "../../dto/response/interest/interest.response.dto";

export class InterestMapper {
    static toInterestResponseDto(interest: IInterest): InterestResponseDto {
        return {
            id: interest._id.toString(),
            name: interest.name,
            categoryId: interest.categoryId ? interest.categoryId.toString() : '',
            isActive: interest.isActive
        };
    }

    static toInterestResponseDtoList(interests: IInterest[]): InterestResponseDto[] {
        return interests.map(this.toInterestResponseDto);
    }
}
