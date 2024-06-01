"use server";
import { pool } from '../../lib/db.js';
import { getSessionData } from '../../actions/getSessionData.js';

export async function createSearch(processedFile) {
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      throw new Error('No session data found');
    }

    const userId = sessionData.userId;

    const dbResponse = await pool.query('INSERT INTO searches (search_data, user_id) VALUES ($1, $2) RETURNING *', [processedFile, userId]);
    if (dbResponse.rows.length === 1) {
      return dbResponse.rows[0];
    } else {
      throw new Error('Unable to create new search');
    }
  } catch (error) {
    console.error('Error while generating results:', error);
    return { success: false, message: 'Unable to craeate new search'};
  }
}