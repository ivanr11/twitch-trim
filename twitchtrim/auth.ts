import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Google({
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
					scope: ["openid https://www.googleapis.com/auth/youtube.upload"],
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				// First-time login, save the `access_token`, its expiry and the `refresh_token`
				return {
					...token,
					access_token: account.access_token,
					expires_at: account.expires_at,
					refresh_token: account.refresh_token,
				};
			} // else if (token.exp && Date.now() < token.exp * 1000) {
			// 	return token;
			// } else {
			//     if (!account.refresh_token) throw new TypeError("Missing refresh_token")

			//     try {
			//         const response = await fetch("https://oauth2.googleapis.com/token", {
			//             method: 'POST',
			//             body: new URLSearchParams({
			//                 client_id: process.env.AUTH_GOOGLE_ID!,
			//                 client_secret: process.env.AUTH_GOOGLE_SECRET!,
			//                 grant_type: "refresh_token",
			//                 refresh_token: account.refresh_token!,
			//             })
			//         })
			//     }
			// }
			return null;
		},
		async session({ session }) {
			return session;
		},
	},
});
