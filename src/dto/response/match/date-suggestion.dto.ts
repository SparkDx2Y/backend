export interface DateSpotResponseDto {
    id: string;
    name: string;
    address: string;
    rating?: number;
    user_ratings_total?: number;
    location: {
        lat: number;
        lng: number;
    };
    photo_reference?: string;
    types: string[];
    isOpenNow?: boolean;
    businessStatus?: string;
}
