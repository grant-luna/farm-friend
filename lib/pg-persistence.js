const dbQuery = require('./db-query');
console.log(dbQuery);

class PgPersistence {
  async createNewUser(userInputs) {
    const sql = 'INSERT INTO users' + 
                '(first_name, last_name, email, password)' +
                'VALUES ($1, $2, $3, $4)';
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