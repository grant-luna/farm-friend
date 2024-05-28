import { pool } from '../../lib/db.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const formData = await request.json();

    const { userFirstName, userLastName, userEmail, userPassword } = formData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);
    
    const dbResponse = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [userFirstName, userLastName, userEmail, hashedPassword]
    );

    return new Response(JSON.stringify(dbResponse.rows[0]), { status: 201 });
  } catch (error) {
    console.error('Database insertion error:', error);
    return new Response(JSON.stringify({ error: 'Database insertion error' }), { status: 500 });
  }
}