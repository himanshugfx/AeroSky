import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // High secure check for admin/admin
                if (credentials?.username === "admin" && credentials?.password === "admin") {
                    return { id: "1", name: "Admin", email: "admin@aerosky.com", role: "admin" };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "aerosky-secret-key-123",
};

export default NextAuth(authOptions);
