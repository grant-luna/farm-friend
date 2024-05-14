import { pool } from '../../../lib/db.js';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function POST(request) {
  try {
    const processedFile = JSON.stringify(await request.json());
    
    const dbResponse = await pool.query('INSERT INTO searches (search_data) VALUES ($1) RETURNING *', [processedFile]);
    return Response.json(dbResponse);
  } catch (error) {
    console.error('Database insertion error:', error);

    return Response.json('error');
  }
}
