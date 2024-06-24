"use server";
import { pool } from '../../lib/db.js';
import { sql } from '@vercel/postgres';
import { getSessionData } from '../../actions/getSessionData.js';

export async function fetchSearchData(searchId) {
  try {
    const sessionData = await getSessionData();

    if (sessionData.error) {
      throw new Error('Error accessing session data in fetchSearchData.js');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error('Error accessing user ID in session data in fetchSearchData.js');
    }

    const searchDataResponse = await sql`SELECT * FROM searches WHERE id = ${searchId} AND user_id = ${userId};`;
    if (searchDataResponse.rows.length === 0) {
      throw new Error('Unable to locate search with the provided search ID');
    }

    return searchDataResponse.rows[0];
  } catch (error) {
    console.error('Error fetching search data:', error);
    return { error: error.message };
  }
}