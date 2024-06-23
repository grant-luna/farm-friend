"use server";
import { getSessionData } from '../../actions/getSessionData.js';
import { pool } from '../../lib/db.js';

export async function fetchSearches() {
  try {
    const sessionData = await getSessionData();
    const userId = sessionData.userId;
    const userSearches = await pool.query(
      'SELECT * FROM searches WHERE user_id = $1;',
      [userId]
    );

    return userSearches.rows
  } catch (error) {
    console.error('Error fetching use searches:', error);
    return { success: false, message: error.message };
  }
}