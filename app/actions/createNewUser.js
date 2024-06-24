"use server";
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function createNewUser(formData) {
  try {
    const { userFirstName, userLastName, userEmail, userPassword } = formData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    const userExists = await checkIfUserExists(userEmail);
    if (userExists) {
      throw new Error('A user with the provided email already exists.');
    }
    
    const createNewUserResponse = await sql`INSERT INTO users (first_name, last_name, email, password) VALUES (${userFirstName}, ${userLastName}, ${userEmail}, ${hashedPassword}) RETURNING *`
    if (!createNewUserResponse.rows.length === 1) {
      throw new Error('Error with inserting new user into database');
    }
    
    return createNewUserResponse.rows[0];
  } catch (error) {
    console.error('Database insertion error:', error);
    return { error: error.message };  
  }
}

async function checkIfUserExists(userEmail) {
  try {
    const dbResponse = await sql`SELECT * FROM users WHERE email = ${userEmail};`;
    if (dbResponse.rows.length === 1) {
      return true;
    } 
  } catch (error) {
    console.error()
  }
}