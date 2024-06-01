"use server";
import { pool } from '../../lib/db.js';
import { getSessionData } from '../../actions/getSessionData.js';

export async function fetchSearchData(searchId) {
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      throw new Error('No session data found');
    }

    const userId = sessionData.userId;
    const dbResponse = await pool.query(
      'SELECT * FROM searches WHERE id = $1 AND user_id = $2',
      [searchId, userId]
    );

    if (dbResponse.rows.length === 0) {
      return { success: false, message: 'No search data found' };
    }

    return { success: true, data: dbResponse.rows[0] };
    
  } catch (error) {
    console.error('Error fetching search data:', error);
    return { success: false, message: error.message };
  }
}