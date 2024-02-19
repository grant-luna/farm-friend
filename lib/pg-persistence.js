const dbQuery = require('./db-query');
const bcrypt = require('bcrypt');

class PgPersistence {
  async authenticate(email, password) {
    const sql = 'SELECT password FROM users' +
                ' WHERE email = $1';
    
    const result = await dbQuery(sql, email);
    if (result.rowCount === 0) return false;

    return bcrypt.compare(password, result.rows[0].password);
  }

  async createNewUser(userInputs) {
    const sql = 'INSERT INTO users' + 
                ' (first_name, last_name, email, password)' +
                ' VALUES ($1, $2, $3, $4)';
    const newUser = await dbQuery(
      sql,
      userInputs.firstName,
      userInputs.lastName,
      userInputs.email,
      userInputs.password
    );

    console.log(newUser);
    return true;
  }

  async findUserIdByEmail(userEmail) {
    const sql = 'SELECT id FROM users WHERE email = $1';

    const dbQueryResult = await dbQuery(sql, userEmail);
    if (dbQueryResult.length === 0) {
      return false;
    }
    console.log(dbQueryResult);
    return dbQueryResult.rows[0].id;
  }

  async saveSearchToDatabase(userEmail, jsonBody) {
    const userId = await this.findUserIdByEmail(userEmail);
    if (!userId) return false;
    const sql = 'INSERT INTO searches (user_id, json_data)' +
                ' VALUES ($1, $2)';
    console.log(JSON.stringify(jsonBody));
    await dbQuery(sql, userId, JSON.stringify(jsonBody));              
    return true;
  }
}

module.exports = PgPersistence;