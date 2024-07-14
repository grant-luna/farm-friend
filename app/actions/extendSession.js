"use server";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getSessionData } from './getSessionData.js';

export async function extendSession() {
  try {
    const sessionData = await getSessionData();
    const secretKey = process.env.SECRET;
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = sessionData.exp;
    const timeRemaining = expirationTime - currentTime;
    
    if (timeRemaining <= 5 * 60) {
      const tokenExpiresIn = '1h';
      const newToken = jwt.sign({
        userId: sessionId.userId,
        userEmail: sessionData.userEmail,
        userFirstName: sessionData.userFirstName,
      }, secretKey, { algorithm: 'HS256', expiresIn: tokenExpiresIn });

      const cookieExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
      cookies().set('session', newToken, { expires: cookieExpires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      console.log('hello');
      return { success: 'Session extended successfully' };
    }

    return { success: 'Session not extendable'};
  } catch (error) {
    console.error('Extend Session Error', error);
    return { error: error.message };  
  }
}