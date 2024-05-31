"use server";
import { pool } from '../../lib/db.js';

export async function createSearch(processedFile) {
  try {
    const userId = '';
    const dbResponse = await pool.query('INSERT INTO searches (search_data, user_id) VALUES ($1, $2) RETURNING *', [processedFile, userId]);
    return Response.json(dbResponse);

    const response = await fetch('/fasterFastPeopleSearch/createSearch/api', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedFile),
    });

    const responseData = await response.json();
    
    const insertedData = responseData.rows[0];
    const searchId = insertedData.id;
    router.push(`/fasterFastPeopleSearch/searches/${searchId}`);
  } catch (error) {
    console.error('Error while generating results:', error);
  }
}