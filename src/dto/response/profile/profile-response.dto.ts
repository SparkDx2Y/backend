export interface ProfileResponseDto {
    age?: number | undefined;
    gender?: "male" | "female";
    interestedIn?: "male" | "female" | undefined;
    photos: string[];
}
