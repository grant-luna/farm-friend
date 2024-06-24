"use server";
import { sql } from '@vercel/postgres';
import { pool } from '../../lib/db.js';
import { getSessionData } from '../../actions/getSessionData.js';

export async function createSearch(checkoutObject) {
  const checkoutObjectCopy = JSON.parse(checkoutObject);

  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      throw new Error('No session data found');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error("Unable to locate user ID in session data.'");
    }

    const insertSearchResponse = await sql`
    INSERT INTO searches (search_data, search_name, user_id)
    VALUES (${checkoutObjectCopy.data}, ${checkoutObjectCopy.searchName}, ${userId})
    RETURNING *;
    `;

    if (insertSearchResponse.rows.length !== 1) {
      throw new Error('Error with inserting search data into database.');
    }

    const updateSearchCountResponse = await sql`
    UPDATE users
    SET faster_fast_people_search_count = faster_fast_people_search_count + 1
    WHERE id = ${userId};
    `;

    return insertSearchResponse.rows[0];

  } catch (error) {    
    console.error('Error while generating results:', error);
    return { error: error.message };
  }
}
