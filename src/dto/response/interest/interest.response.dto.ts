

export interface InterestResponseDto {
    id: string;
    name: string;
    categoryId: string;
    category?: {
        id: string;
        name: string;
    };
    isActive: boolean;
}