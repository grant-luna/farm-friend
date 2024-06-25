"use server"
import { sql } from '@vercel/postgres';
import { getSessionData } from '../../actions/getSessionData.js';

export async function fetchMatchingTemplates() {
  try {
    const sessionData = await getSessionData();
    if (!sessionData) {
      throw new Error('Error accessing session data in fetchMatchingTemplates.js');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error('Error accessing the user ID in session data in fetchMatchingTemplates.js');
    }

    const userTemplatesResponse = await sql`SELECT * FROM search_templates WHERE user_id = ${userId}`;
    return userTemplatesResponse.rows;
  } catch (error) {
    console.error('Error fetching matching templates', error);
    return { error: error.message };
  }
}