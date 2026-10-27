import GoogleProvider from "next-auth/providers/google";
import { AuthOptions, TokenSet } from "next-auth";
import { JWT } from "next-auth/jwt";

// Helper function to refresh the access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (!token.refreshToken) {
            throw new Error("No refresh token available");
        }

        const url = "https://oauth2.googleapis.com/token";
        const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
        });

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        const refreshedTokens: TokenSet = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        console.log("Token refreshed successfully");

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + (refreshedTokens.expires_in as number) * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
            error: undefined,
        };
    } catch (error) {
        console.error("RefreshAccessTokenError", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/drive.file",
                    // No forced "consent" prompt: returning users sign in silently.
                    // Google only issues a refresh token on consent, so when it is missing
                    // the client re-runs sign-in with prompt=consent (see SessionGuard).
                    access_type: "offline", // Essential for getting a refresh token
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    accessTokenExpires: Date.now() + (typeof account.expires_in === "number" ? account.expires_in : 3600) * 1000,
                    refreshToken: account.refresh_token,
                    user,
                    error: account.refresh_token ? undefined : "MissingRefreshToken",
                };
            }

            // Return previous token if the access token has not expired yet (with a buffer)
            if (Date.now() < ((token.accessTokenExpires as number) - 5000)) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            // Never hand out a token we know is stale; API routes then answer 401
            session.accessToken = token.error ? undefined : token.accessToken;
            session.error = token.error;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
