"use server";
import { getSessionData } from '../../actions/getSessionData.js';
import { sql } from '@vercel/postgres';

export async function fetchSearches() {
  try {
    const sessionData = await getSessionData();
    if (sessionData.error) {
      throw new Error('Error with accessing session data in fetchSearches.js');
    }
    const userId = sessionData.userId;
    if (!userId) {
      throw new Error('Unable to locate user ID in session data in fetchSearches.js');
    }

    const userSearches = await sql`SELECT * FROM searches WHERE user_id = ${userId}`;

    return userSearches.rows
  } catch (error) {
    console.error('Error fetching use searches:', error);
    return { success: false, message: error.message };
  }
}