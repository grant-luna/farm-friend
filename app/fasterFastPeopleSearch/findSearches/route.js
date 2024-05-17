import { pool } from '../../lib/db.js';

export async function GET() {
  try {
    const dbResponse = await pool.query(`SELECT * FROM searches`);
    return Response.json(dbResponse);
  } catch (error) {
    console.error('Unable to locate searches');

    return Response.json(dbResponse);
  }
}