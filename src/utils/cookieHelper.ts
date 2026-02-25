
import type { Response, CookieOptions } from "express";

const getCookieOptions = (): CookieOptions => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    };
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    const options = getCookieOptions();

    res.cookie("accessToken", accessToken, {
        ...options,
        maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const setAccessTokenCookie = (res: Response, accessToken: string) => {
    const options = getCookieOptions();

    res.cookie("accessToken", accessToken, {
        ...options,
        maxAge: 15 * 60 * 1000, // 15 mins
    });
};

export const clearAuthCookies = (res: Response) => {
    const options = getCookieOptions();

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
};

export const setTempCookie = (res: Response, cookieName: string, cookieValue: string) => {
    const options = getCookieOptions();

    res.cookie(cookieName, cookieValue, {
        ...options,
        maxAge: 5 * 60 * 1000 // 5 minutes
    });
};

export const clearTempCookie = (res: Response, cookieName: string) => {
    const options = getCookieOptions();
    res.clearCookie(cookieName, options);
};
