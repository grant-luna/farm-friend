"use server";

import { pool } from '../lib/db.js';
import bcrypt from 'bcryptjs';

export async function createNewUser(formData) {
  try {
    const { userFirstName, userLastName, userEmail, userPassword } = formData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);
    
    const dbResponse = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [userFirstName, userLastName, userEmail, hashedPassword]
    );

    return dbResponse
  } catch (error) {
    console.error('Database insertion error:', error);
    return new Error('Database insertion error');
  }
}