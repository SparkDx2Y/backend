/**
 * Internal DTO for checking profile completion
 * This represents the minimum data needed to validate profile completion
 */


export interface ProfileCompletionCheckDto {
    age?: number;
    gender?: 'male' | 'female';
    interestedIn?: 'male' | 'female';
    photos?: string[];
}
