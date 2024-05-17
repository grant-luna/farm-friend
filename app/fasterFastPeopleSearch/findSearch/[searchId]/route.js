import { pool } from '../../../lib/db.js';

export async function GET(request, { params }) {
  try {
    const searchId = params.searchId;
    const dbResponse = await pool.query(`SELECT * FROM searches WHERE id = $1`, [searchId]);

    if (dbResponse.rows.length === 1) {
      return Response.json(dbResponse.rows[0]);
    } else {
      throw new Error('Error locating search');
    }
  } catch (error) {
    console.error('Unable to find search for given ID:', error);

    return Response.json(dbResponse);
  }
}