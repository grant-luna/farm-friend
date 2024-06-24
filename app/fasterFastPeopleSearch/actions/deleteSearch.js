"use server"
import { sql } from '@vercel/postgres';
import { getSessionData } from '../../actions/getSessionData.js';

export async function deleteSearch(searchId) {  
  try {
    const sessionData = await getSessionData();

    if (sessionData.error) {
      throw new Error('Error accessing session data');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error('Unable to find user ID in session data.');
    }

    const deleteSearchResponse = await sql`
    DELETE from searches
    WHERE id = ${searchId} AND user_id = ${userId}
    RETURNING *;
    `;
    console.log(deleteSearchResponse);

    if (deleteSearchResponse.rows.length !== 1) {
      throw new Error('Error deleting search from database');
    }

    const updateSearchCountResponse = await sql`
    UPDATE users
    SET faster_fast_people_search_count = faster_fast_people_search_count - 1
    WHERE id = ${userId}
    RETURNING *;
    `;

    if (updateSearchCountResponse.rows.length !== 1) {
      console.error(`Error with updating user's search count in deleteSearch.js'`);
    }

    return deleteSearchResponse.rows[0];

  } catch (error) {
    console.error('Error while deleting search:', error);
    return { error: error.message };
  }
}
