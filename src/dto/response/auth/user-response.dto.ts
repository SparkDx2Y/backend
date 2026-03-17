export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  profilePhoto?: string | null;
  interests?: string[];
  isProfileCompleted: boolean;
  isInterestsSelected: boolean;
  isLocationCompleted: boolean;
  hasPassword?: boolean;
}
