"use server"
import { pool } from '../../lib/db.js';
import { getSessionData } from '../../actions/getSessionData.js';

export async function updateSearchName(search, newSearchName) {
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      throw new Error('Unable to locate session data');
    }
    const userId = sessionData.userId;

    const updateSearchResponse = await pool.query(
      `
      UPDATE searches
      SET search_name = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
      `
    , [newSearchName, search.id, userId]);

    if (updateSearchResponse.rows.length !== 1) {
      throw new Error("Unable to update search name");
    }

    return { success: true, updatedSearch: updateSearchResponse.rows[0]};
  } catch (error) {
    console.error('Error while updating search name:', error);
    return { success: false, message: error.message };
  }
}