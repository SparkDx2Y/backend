import type { DateSpotResponseDto } from "../../dto/response/match/date-suggestion.dto";

export interface IPlacesRepository {
    getNearbyPlaces(lat: number, lon: number, radius: number, type: string): Promise<DateSpotResponseDto[]>;
}
