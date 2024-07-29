// auth.ts

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { getStringFromBuffer } from './lib/utils';
import { getUser } from './app/login/actions';
import { readAllowedEmails, readBlacklist } from './lib/jsonUtils';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJsonData() {
  const res = await fetch(`${API_URL}/api/read-json`);
  if (!res.ok) {
    throw new Error('Failed to fetch JSON data');
  }
  const data = await res.json();
  return data;
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.JWT_SECRET, // Bu satırı buraya taşıyın
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // JSON verilerini API route'dan çekin
          const { allowedEmails, blacklist } = await fetchJsonData();

          if (!allowedEmails.includes(email)) {
            throw new Error('Bu e-posta adresi kayıt için izinli değil.');
          }

          if (blacklist.includes(email)) {
            throw new Error('Bu kullanıcı oturum açamaz.');
          }

          const user = await getUser(email);

          if (!user) return null;

          const encoder = new TextEncoder();
          const saltedPassword = encoder.encode(password + user.salt);
          const hashedPasswordBuffer = await crypto.subtle.digest(
            'SHA-256',
            saltedPassword
          );
          const hashedPassword = getStringFromBuffer(hashedPasswordBuffer);

          if (hashedPassword === user.password) {
            return user;
          } else {
            return null;
          }
        }

        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // JSON verilerini API route'dan çekin
      const { blacklist } = await fetchJsonData();

      if (blacklist.includes(token.email)) {
        // Kullanıcıyı oturumdan çıkarmak için session.user'ı boş bir nesne ile güncelleyin
        session.user = { id: '', name: '', email: '', image: '' };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
  }
});
