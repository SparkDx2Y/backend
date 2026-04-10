import { inject, injectable } from "inversify";
import { IDateSuggestionService } from "./IDateSuggestionService";
import { IPlacesRepository } from "../../repositories/date-suggestion/IPlacesRepository";
import { DateSpotResponseDto } from "../../dto/response/match/date-suggestion.dto";
import { DI_TYPES } from "../../di/types";
import logger from "../../config/logger";
import { GeoUtils } from "../../utils/geoUtils";

@injectable()
export class DateSuggestionService implements IDateSuggestionService {
    
    constructor(
        @inject(DI_TYPES.REPOSITORIES.PLACES_REPOSITORY)
        private readonly _placesRepo: IPlacesRepository
    ) {}

    public async getMidpointSuggestions( lat1: number, lon1: number, lat2: number, lon2: number, type: string = "cafe" ): Promise<DateSpotResponseDto[]> {
        const { lat, lon } = GeoUtils.calculateMidpoint(lat1, lon1, lat2, lon2);

        logger.info(`Requesting date suggestions for midpoint (${lat}, ${lon})`);

        return this._placesRepo.getNearbyPlaces(lat, lon, 2000, type);
    }
}
