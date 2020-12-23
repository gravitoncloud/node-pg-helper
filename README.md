# node-pg-helper
common helper functions for node-postgres

# Examples

### Setup postgres connection
```javascript
const { Pool } = require('pg');

const db = require('node-pg-helper');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
```

## Set the client as Pool
```javascript
db.setClient(pool);
```

## example insert
```javascript
await db.insert('users', {
    'id': 100,
    'firstname': 'john',
    'lastname': 'smith'
})
```

## example upsert
```javascript
await db.upsert('users', {
    'id': 100,
    'firstname': 'john',
    'lastname': 'snow'
}, 'id');
```

## example update
```javascript
await db.update('users',{
    'lastname': 'snow'
},
{
    'id': 100
});
```

## select all the rows in a table
```javascript
let rows = await db.selectAllRows("users");

rows.forEach(row => {
    console.log(row);
});
```