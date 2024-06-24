"use server";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET;

export async function getSessionData() {
  try {
    const sessionCookie = cookies().get('session');
    if (!sessionCookie) {
      throw new Error('Unable to locate session cookie');
    }

    const sessionCookieValue = sessionCookie.value;

    try {
      const decodedToken = jwt.verify(sessionCookieValue, secretKey, { algorithms: ['HS256'] });
      return decodedToken;
    } catch (jwtError) {
      console.error('Invalid or expired token', jwtError);
      throw new Error('Invalid or expired session');
    }
  } catch (error) {
    console.error('Unable to get session data', error);
    return { error: error.message };
  }
}