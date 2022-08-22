
const db = require('../index');

console.log("Unit Tests");

(async () => {
    let rows = await db.queryRows('select now()');
    console.log(rows);
})()
