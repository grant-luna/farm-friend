"use server";
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
    if (!checkoutObjectCopy.searchName) {
      checkoutObjectCopy.searchName = `${new Date().toLocaleDateString()} - ${JSON.parse(checkoutObjectCopy.data).length} Records`;
    }

    await pool.query('BEGIN');

    const insertResponse = await pool.query(
      `
      INSERT INTO searches (search_data, search_name, user_id)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [checkoutObjectCopy.data, checkoutObjectCopy.searchName, userId]
    );

    if (insertResponse.rows.length !== 1) {
      throw new Error('Unable to create search');
    }

    const updateResponse = await pool.query(
      `
      UPDATE users
      SET faster_fast_people_search_count = faster_fast_people_search_count + 1
      WHERE id = $1;
      `,
      [userId]
    );

    await pool.query('COMMIT');

    return insertResponse.rows[0];

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error while generating results:', error);
    return { success: false, message: error.message };
  }
}
