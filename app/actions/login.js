"use server";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

const secretKey = process.env.SECRET;

export async function login(user) {
  const userId = user["id"];
  const userEmail = user["email"];
  const userFirstName = user["first_name"];
  
  const tokenExpiresIn = '1h';
  const token = jwt.sign({ userId, userEmail, userFirstName }, secretKey, { algorithm: 'HS256', expiresIn: tokenExpiresIn });

  const cookieExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  cookies().set('session', token, { expires: cookieExpires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  redirect('/');
}
