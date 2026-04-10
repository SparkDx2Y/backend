import { inject, injectable } from "inversify";
import { IPlacesRepository } from "./IPlacesRepository";
import { DateSpotResponseDto } from "../../dto/response/match/date-suggestion.dto";
import { DI_TYPES } from "../../di/types";
import { Redis } from "ioredis";
import logger from "../../config/logger";
import { GooglePlacesResponse } from "../../types/external/google-places";

@injectable()
export class GooglePlacesRepository implements IPlacesRepository {
    private readonly GOOGLE_PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

    constructor(
        @inject(DI_TYPES.External.REDIS)
        private readonly _redis: Redis
    ) {}

    public async getNearbyPlaces(lat: number, lon: number, radius: number, type: string): Promise<DateSpotResponseDto[]> {
        const cacheKey = `places:${lat.toFixed(3)}:${lon.toFixed(3)}:${type}:${radius}`;

        try {
            const cached = await this._redis.get(cacheKey);
            if (cached) {
                logger.debug(`[PlacesRepo] Cache hit for ${cacheKey}`);
                return JSON.parse(cached);
            }

            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                logger.error("GOOGLE_MAPS_API_KEY is not set");
                return [];
            }

            const queryParams = new URLSearchParams({
                location: `${lat},${lon}`,
                radius: radius.toString(),
                type: type,
                key: apiKey
            });

            const response = await fetch(`${this.GOOGLE_PLACES_API_URL}?${queryParams.toString()}`);
            
            if (!response.ok) {
                logger.error(`Google API error: ${response.status}`);
                return [];
            }

            const data = await response.json() as GooglePlacesResponse;

            if (data.status === "ZERO_RESULTS") return [];
            if (data.status !== "OK") {
                logger.error(`Google API Status error: ${data.status}`, data.error_message);
                return [];
            }

            const results: DateSpotResponseDto[] = data.results.map((place) => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                user_ratings_total: place.user_ratings_total,
                location: place.geometry.location,
                photo_reference: place.photos?.[0]?.photo_reference,
                types: place.types
            }));

            if (results.length > 0) {
                await this._redis.setex(cacheKey, 86400, JSON.stringify(results));
            }

            return results;

        } catch (error) {
            logger.error("Error in GooglePlacesRepository:", error);
            return [];
        }
    }
}
