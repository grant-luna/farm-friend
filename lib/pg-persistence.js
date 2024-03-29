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

    return true;
  }

  async deleteSearch(searchId) {
    const sql = 'DELETE FROM searches WHERE id = $1';

    try {
      await dbQuery(sql, searchId);
      return true;
    } catch (error) {
      console.error('Error deleting search:', error);
      return false;
    }
  }

  async findSearchBySearchId(searchId) {
    const sql = 'SELECT json_data FROM searches' +
                ' WHERE id = $1';
    
    const result = await dbQuery(sql, searchId);
    if (result.rows.length !== 1) {
      return false;
    } else {
      return result.rows[0].json_data;
    }
  }

  async findUserIdByEmail(userEmail) {
    const sql = 'SELECT id FROM users WHERE email = $1';

    const dbQueryResult = await dbQuery(sql, userEmail);
    if (dbQueryResult.length === 0) {
      return false;
    }
  
    return dbQueryResult.rows[0].id;
  }

  async findUserSearches(userEmail) {
    const sql = "SELECT searches.id, file_name, TO_CHAR(date_created, 'MM-DD-YYYY') AS date_created, json_data FROM searches" +
                " INNER JOIN users ON user_id = users.id" +
                ' WHERE email = $1';
    const dbQueryResult = await dbQuery(sql, userEmail);
    
    return dbQueryResult.rows;
  }

  async saveSearchToDatabase(searchId, userEmail, fileName, parsedCsvString) {
    const userId = await this.findUserIdByEmail(userEmail);
    if (!userId) return false;

    const sql = 'INSERT INTO searches (id, file_name, user_id, json_data)' +
                ' VALUES ($1, $2, $3, $4)';
    
    await dbQuery(sql, searchId, fileName, userId, JSON.stringify(parsedCsvString));              
    return true;
  }

  async updateSearchData(searchId, searchData) {
    const sql = 'UPDATE SEARCHES' +
                ' Set json_data = $2' +
                ' WHERE id = $1';
    
    try {
      await dbQuery(sql, searchId, JSON.stringify(searchData));
      return true;
    } catch (error) {
      console.log('Error updating the search data: ', error);
      return false;
    }
  }
}

module.exports = PgPersistence;