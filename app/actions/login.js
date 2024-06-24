"use server";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';

export async function login(user) {
  const userId = user["id"];
  const userEmail = user["email"];
  const userFirstName = user["first_name"];
  const secretKey = process.env.SECRET;

  if (!secretKey) {
    throw new Error('Secret key is not defined.');
  }

  try {
    await sql`UPDATE users SET logins = logins + 1 WHERE id = ${userId};`
  } catch (error) {
    console.error('Error with updating user login count upon login.', error);
  }
  
  const tokenExpiresIn = '1h';
  const token = jwt.sign({ userId, userEmail, userFirstName }, secretKey, { algorithm: 'HS256', expiresIn: tokenExpiresIn });

  const cookieExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  cookies().set('session', token, { expires: cookieExpires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  redirect('/fasterFastPeopleSearch');
}
