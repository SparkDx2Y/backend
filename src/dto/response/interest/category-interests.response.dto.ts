import { InterestResponseDto } from "./interest.response.dto";

export interface CategoryWithInterestsResponseDto {
    id: string;
    name: string;
    interests: InterestResponseDto[];
}
