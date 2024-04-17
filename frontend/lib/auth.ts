import { AxiosResponse } from 'axios';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { axiosPrivate } from './axios';

export const authOptions: NextAuthOptions = {
  secret: process.env.SESSION_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    verifyRequest: '/',
    newUser: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'jsmith@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          let res: AxiosResponse;

          if (credentials.is_registration == 'true') {
            res = await axiosPrivate.post('/api/auth/registration/', {
              email: credentials?.email,
              password1: credentials?.password,
              password2: credentials?.password,
            });
          } else {
            res = await axiosPrivate.post('/api/auth/login/', {
              email: credentials?.email,
              password: credentials?.password,
            });
          }

          const data: any = res.data;

          if (data.user) {
            return data;
          } else if (data.detail === 'Verification e-mail sent.') {
            throw new Error('verificationEmailSent');
          } else {
            return null;
          }
        } catch (e: any) {
          if (e.response && e.response.data) {
            throw new Error(
              JSON.stringify({ errors: e.response.data, status: false })
            );
          }
          throw e;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      token = {
        ...token,
        ...user,
      };
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      // Send properties to the client, like an access_token and user id from a provider.
      // Check if token is invalid due to an error
      if (token && token.error) {
        // Token is invalid due to an error, perform logout or refresh token logic
        return {
          ...session,
          error: token.error,
        };
      }

      session.user = {
        ...token.user,
        access: token.access,
        refresh: token.refresh,
      };
      return session;
    },
  },
};
