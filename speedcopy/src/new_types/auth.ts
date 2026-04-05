import { UUID, PhoneNumber, ISODateString, UserRole, City } from "./shared";

export interface LoginRequest {
    phone: PhoneNumber;
    password?: string; // MVP might want a simple password or just OTP mock
}

export interface AuthTokens {
    accessToken: string;
}

export interface AuthenticatedUser {
    id: UUID;
    phone: PhoneNumber;
    role: UserRole;
    name?: string;
    email?: string;
}

export interface LoginResponse {
    tokens: AuthTokens;
    user: AuthenticatedUser;
}

export interface CustomerProfile {
    id: UUID;
    phone: PhoneNumber;
    name: string;
    email?: string;
    city?: City;
    isActive: boolean;
    createdAt: ISODateString;
}
