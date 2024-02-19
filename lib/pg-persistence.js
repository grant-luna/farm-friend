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
}

module.exports = PgPersistence;