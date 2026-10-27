import { User } from "next-auth";
import "next-auth/jwt";

type AuthError = "MissingRefreshToken" | "RefreshAccessTokenError";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        error?: AuthError;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        accessTokenExpires?: number;
        refreshToken?: string;
        user?: User;
        error?: AuthError;
    }
}
