import { sql } from '@vercel/postgres';
import { pool } from '../../lib/db.js';
import { NextResponse } from 'next/server';
import { getSessionData } from '../../actions/getSessionData.js';

export async function GET(request) {
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      return NextResponse.json({ error: 'No session data found.' }, { status: 401 });
    }
    const userEmail = sessionData.userEmail;
    if (!userEmail) {
      return NextResponse.json({ error: 'No user email was found in session data' }, { status: 400 });
    }

    const userIsAdmin = await checkIfUserIsAdmin(userEmail);
    if (userIsAdmin) {
      try {
        await createDatabaseTables();
        console.log('Database tables were created successfully');
        return NextResponse.json({ message: 'Database tables were created successfully' });
      } catch (error) {
        console.error('Error with creating database tables', error);
        return NextResponse.json({ error: 'Error creating database tables.' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 403 });
    }
  } catch (error) {
    console.error('Unable to check if user is admin', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function checkIfUserIsAdmin(userEmail) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error('Unable to locate admin email.');
    }

    return userEmail === adminEmail;
  } catch (error) {
    console.error('Error checking if user is admin', error);
    throw new Error('Database query error');
  }
}

async function createDatabaseTables() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        logins INTEGER NOT NULL DEFAULT 0,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        faster_fast_people_search_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS searches (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        search_name VARCHAR(255) NOT NULL,
        search_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS search_templates (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        template_name VARCHAR(255) NOT NULL,
        headers JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `;
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw new Error('Error creating database tables.');
  }
}