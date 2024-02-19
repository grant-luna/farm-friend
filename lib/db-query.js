const { Client } = require('pg');

async function dbQuery(statement, ...parameters) {
  let client = new Client({ database: 'ffps' });

  await client.connect();
  let result = await client.query(statement, parameters);
  await client.end();

  return result;
}

module.exports = dbQuery;