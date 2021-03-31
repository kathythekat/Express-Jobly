const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// Helper function to update database partially.
// For dataToUpdate, pass in data, then pass in jsToSql {firstName, lastName, isAdmin}

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "), //setCols: '"first_name"=$1', '"age"=$2'
    values: Object.values(dataToUpdate), //values:[first_name, age]
  };
}

module.exports = { sqlForPartialUpdate };
