export interface MatchActionWithUsersDto {
    _id: string;
    action: 'like' | 'pass';
    createdAt: Date;
    fromUserId: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
    toUserId: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
}
