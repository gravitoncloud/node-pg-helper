# node-pg-helper
common helper functions for node-postgres

# Examples 
const { Pool } = require('pg');

const db = require('node-pg-helper');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

console.log("tester");

//Set the client as Pool
db.setClient(pool);

(async function() {

    // example insert
    await db.insert('users', {
        'id': 100,
        'firstname': 'john',
        'lastname': 'smith'
    })

    //select all the rows in a table
    let rows = await db.selectAllRows("users");

    rows.forEach(row => {
        console.log(row);
    });

})();