"use server"
import { pool } from '../../lib/db.js';
import { getSessionData } from '../../actions/getSessionData.js';

export async function deleteSearch(searchId) {  
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      throw new Error('No session data found');
    }

    const userId = sessionData.userId;

    await pool.query('BEGIN');

    const deleteResponse = await pool.query(
      `
      DELETE FROM searches 
      WHERE id = $1 AND user_id = $2
      RETURNING *;
      `,
      [searchId, userId]
    );

    if (deleteResponse.rows.length !== 1) {
      throw new Error('Unable to delete search');
    }

    const updateResponse = await pool.query(
      `
      UPDATE users
      SET faster_fast_people_search_count = faster_fast_people_search_count - 1
      WHERE id = $1;
      `,
      [userId]
    );

    await pool.query('COMMIT');

    return { success: true, deletedSearch: deleteResponse.rows[0]}

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error while deleting search:', error);
    return { success: false, message: error.message };
  }
}
