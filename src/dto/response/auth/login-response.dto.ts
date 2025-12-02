import { UserResponseDto } from "./user-response.dto";

export interface LoginResponseDto {
  token: string;
  refreshToken: string;
  user: UserResponseDto;
}
