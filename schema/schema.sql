CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
  ID UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
)

CREATE TABLE title_reps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company_id NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  faster_fast_people_search_count NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title_rep_id NOT NULL REFERENCES title_rep(id) ON DELETE SET NULL
);

CREATE TABLE searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  search_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id NOT NULL REFERENCES users(id) ON DELETE CASCADE
);