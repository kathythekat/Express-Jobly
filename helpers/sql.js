const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// Helper function to update database partially.
// For dataToUpdate, pass in data (object with keys/values), then pass in jsToSql {firstName, lastName, isAdmin}
// returns {setCols: '"first_name"=$1', '"age"=$2', values:[first_name, age]}

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "), 
    values: Object.values(dataToUpdate) 
  };
}

module.exports = { sqlForPartialUpdate };

