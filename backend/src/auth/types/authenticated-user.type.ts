export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}
