"use server";
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function verifyUser(formData) {  
  try {
    const { userEmail, userPassword } = formData;

    if (!userEmail || !userPassword) {
      throw new Error('Missing user email or user password to verify user.')
    }

    const verifyUserResponse = await sql`SELECT * FROM users WHERE email = ${userEmail}`;
    if (verifyUserResponse.rows.length === 0) {
      throw new Error('Unable to locate a user with the provided email.');
    }
    
    const user = verifyUserResponse.rows[0];

    const validPassword = await bcrypt.compare(userPassword, user.password);
    if (!validPassword) {
      throw new Error('Invalid password provided.');
    }

    return user;
  } catch (error) {
    console.error('Verify user error:', error);
    return { error: error.message };
  }
}