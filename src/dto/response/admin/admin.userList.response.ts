export interface AdminUserListResponseDto {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    role: 'user' | 'admin';
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    profilePhoto: string | null;
  }
  