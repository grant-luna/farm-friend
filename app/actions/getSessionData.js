"use server";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET;

export async function getSessionData() {
  const sessionCookie = cookies().get('session');
  
  if (!sessionCookie) {
    return null;
  }

  const sessionCookieValue = sessionCookie.value;

  try {
    const decodedToken = jwt.verify(sessionCookieValue, secretKey, { algorithms: ['HS256'] });
    return decodedToken;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}