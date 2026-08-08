export interface ProfileResponseDto {
    id: string;
    userId: string;
    name: string;
    age?: number | undefined;
    bio?: string;
    gender?: "male" | "female";
    interestedIn?: "male" | "female" | undefined;
    profilePhoto?: string | null;
    vibeVideo?: string | null;
    coverPhoto?: string | null;
    photos: string[];
    interests: string[];
    distanceKm?: number;
    hasSwiped?: boolean;
}

export interface DiscoverFeedResponseDto {
    profiles: ProfileResponseDto[];
    metadata: {
        searchedRadius: number;
        expandedSearch: boolean;
        totalProfilesFound: number;
        searchLevel: number;
        hasMoreNearbyUsers: boolean;
    };
}

