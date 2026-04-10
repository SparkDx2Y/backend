
export interface GooglePlacePhoto {
    photo_reference: string;
}

export interface GooglePlace {
    place_id: string;
    name: string;
    vicinity: string;
    rating?: number;
    user_ratings_total?: number;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos?: GooglePlacePhoto[];
    types: string[];
}

export interface GooglePlacesResponse {
    results: GooglePlace[];
    status: string;
    error_message?: string;
}
