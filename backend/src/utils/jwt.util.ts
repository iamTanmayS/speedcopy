import jwt from 'jsonwebtoken';
import { env } from '../config/config.js';

export interface TokenPayload {
    userId: string;
    role?: string;
    permissions?: string[];
}

export const generateTokens = (payload: TokenPayload) => {
    const accessToken = jwt.sign(payload, env.jwt_secret, {
        expiresIn: '15m', // Short-lived access token
    });

    const refreshToken = jwt.sign(payload, env.jwt_refresh_secret, {
        expiresIn: '7d', // Long-lived refresh token
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, env.jwt_secret) as TokenPayload;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, env.jwt_refresh_secret) as TokenPayload;
    } catch (error) {
        return null;
    }
};
