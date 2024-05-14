const { Pool } = require('pg');

export const pool = new Pool({
  user: 'grantluna',      // Default to 'grantluna' if environment variable not set
  host: 'localhost',          // Default to local socket in '/tmp' if environment variable not set
  database: 'farm-friend',  // Default to 'farm-friend' if environment variable not set
  password: 'gl90732',            // Highly recommended to use an environment variable for the password
  port: 5432 
});