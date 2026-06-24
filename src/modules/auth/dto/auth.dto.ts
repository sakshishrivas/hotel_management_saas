export interface AuthenticatedUserDto {
  id: string;
  email: string;
  displayName: string;
  status: string;
  emailVerifiedAt: string | null;
  roles: string[];
  permissions: string[];
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface AuthResponseDto {
  user: AuthenticatedUserDto;
  tokens: AuthTokensDto;
}

export interface AuthContextDto {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}
