export interface ProfileResponseDto {
    userId: string;
    name: string;
    age?: number | undefined;
    gender?: "male" | "female";
    interestedIn?: "male" | "female" | undefined;
    photos: string[];
}

