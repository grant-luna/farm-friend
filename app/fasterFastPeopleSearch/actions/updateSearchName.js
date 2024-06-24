"use server"
import { sql } from '@vercel/postgres';
import { getSessionData } from '../../actions/getSessionData.js';

export async function updateSearchName(search, newSearchName) {
  try {
    const sessionData = await getSessionData();

    if (sessionData.error) {
      throw new Error('Error accessing session data in updateSearchName.js');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error('Unable ot access user ID in session data in updateSearchName.js');
    }

    const updateSearchNameResponse =  await sql`
    UPDATE searches
    SET search_name = ${newSearchName}
    WHERE id = ${search.id} AND user_id = ${userId}
    RETURNING *; 
    `;

    if (updateSearchNameResponse.rows.length !== 1) {
      throw new Error('Database error with updating search name.');
    }

    return updateSearchNameResponse.rows[0];
  } catch (error) {
    console.error('Error while updating search name:', error);
    return { error: error.message };
  }
}