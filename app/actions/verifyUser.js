"use server";
import { pool } from '../lib/db.js';
import bcrypt from 'bcryptjs';

export async function verifyUser(formData) {
  const { userEmail, userPassword } = formData;

  try {
    const dbResponse = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [userEmail]
    );

    if (dbResponse.rows.length === 0) {
      throw new Error('Unable to locate a user with the provided email.')
    }

    const user = dbResponse.rows[0];

    const validPassword = await bcrypt.compare(userPassword, user.password);
    if (!validPassword) {
      throw new Error('Invalid Password');
    }

    return user;
  } catch (error) {
    console.error('Databbase query error:', error);
    return new Error(error);
  }
}