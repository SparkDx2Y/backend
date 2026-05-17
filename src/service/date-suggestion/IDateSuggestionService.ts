import type { DateSpotResponseDto } from "../../dto/response/match/date-suggestion.dto";

export interface IDateSuggestionService {
    getMidpointSuggestions(lat1: number, lon1: number, lat2: number, lon2: number, type?: string): Promise<DateSpotResponseDto[]>;
}
