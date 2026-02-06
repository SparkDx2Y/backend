import { UserResponseDto } from "./user-response.dto";

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
