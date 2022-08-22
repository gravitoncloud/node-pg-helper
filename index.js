/*
MIT License

Copyright (c) 2020 William Herrera

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const { Pool } = require('pg');

var _client = null; 

const DEV_MODE = process.env.NODE_ENV === 'development';
const ssl = DEV_MODE ? null : { rejectUnauthorized: false };

if(process.env.DATABASE_URL) {
    _client = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl
    });
}

var _development_query = async (text, values) => {
    var startStack = new Error().stack;
    try {
      return await _client.query(text, values);
    } catch (error) {
      error.stack = error.stack + "\n" +
        startStack.substring(startStack.indexOf("\n") + 1);
      throw error;
    }
}

const _production_query = async function(text, values) {
    return await _client.query(text, values);
}

const _query = DEV_MODE ? _development_query : _production_query;

module.exports = {
    setClient : function (postgresClient) {
        _client = postgresClient;
    },
    connect : async function() {
        return await _client.connect();
    },
    query : async function(query) {
        return await _query(query, undefined);
    },
    query : _query,
    queryRows : async function(text, values) {
        let result = await _query(text, values);
        return result.rows;
    },
    insert : async function( tableName, obj) {
        var keys = Object.keys(obj);
        var values = Object.values(obj);
        let names = "";
        let numbs = "";
        let vals = [];
        for(var i=0; i < keys.length; i++) {
            if(names.length > 0) { names += ","; }
            names += keys[i];            
            if(numbs.length > 0){ numbs += ","; }
            numbs += "$" + (i+1);
            vals.push(values[i]);
        }
        return await _query({text: `INSERT INTO ${tableName} (${names}) VALUES(${numbs});`, values: vals});
    },
    upsert : async function( tableName, obj, conflict) {
        var keys = Object.keys(obj);
        var values = Object.values(obj);
        let names = "";
        let numbs = "";
        let update = "";
        let vals = [];
        for(var i=0; i < keys.length; i++) {
            if(names.length > 0) { names += ","; }
            names += keys[i];            
            if(numbs.length > 0) { numbs += ","; }
            numbs += "$" + (i+1);
            if(i>0) { update += ","; }
            update += keys[i] + "=$" + (i+1);
            vals.push(values[i]);
        }
        return await client.query({
            text : `INSERT into ${tableName} (${names}) VALUES(${numbs}) ON CONFLICT (${conflict}) DO UPDATE SET ${update}`,
            values: vals
        });
    },
    update : async function( tableName, obj, where) {
        var keys = Object.keys(obj);
        var values = Object.values(obj);
        let update = "", whereClause = '';
        let vals = [];
        let i=0;
        for(i; i < keys.length; i++) {            
            if(i>0) update += ",";
            update += keys[i] + "=$" + (i+1);
            vals.push(values[i]);
        }
        keys = Object.keys(where);
        values = Object.values(where);
        for(let j=0; j < keys.length; j++, i++) {            
            if(j>0) whereClause += " and ";
            whereClause += keys[j] + "=$" + (i+1);
            vals.push(values[j]);
        }
        return await _query({
                text: `UPDATE ${tableName} SET ${update} WHERE ${whereClause}`,
                values: vals
        });
    },
    insertReturnId : async function(tableName, obj) {
        var keys = Object.keys(obj);
        var values = Object.values(obj);
        let names = "";
        let numbs = "";
        let vals = [];
        for(var i=0; i < keys.length; i++) {
            if(names.length > 0) names += ",";
            names += keys[i];            

            if(numbs.length > 0) numbs += ",";
            numbs += "$" + (i+1);

            vals.push(values[i]);
        }
        let query = "INSERT INTO " + tableName + "(" + names + ") VALUES(" + numbs + ") RETURNING id;";        
        let result = await _query({"text": query, values: vals});
        return result.rows[0].id;
    },
    delete : async function( tableName, where, client = _client) {
        var keys = Object.keys(where);
        var values = Object.values(where);
        let where_clause = "";
        let vals = [];
        for(var i=0; i < keys.length; i++) {            
            if(i>0) where_clause += " and ";
            where_clause += keys[i] + "=$" + (i+1);
            vals.push(values[i]);
        }
        return await _query({
            text: "DELETE FROM " + tableName + " WHERE " + where_clause,
            values: vals
        });
    },
    deleteAllFromTable : async function(tableName) {
        await _query("DELETE FROM " + tableName + ";");
    },
    select : async function(tableName, where, client = _client) {
        var keys = Object.keys(where);
        var values = Object.values(where);
        let where_clause = "";
        let vals = [];
        for(var i=0; i < keys.length; i++) {            
            if(i>0) where_clause += " and ";
            where_clause += keys[i] + "=$" + (i+1);
            vals.push(values[i]);
        }
        let result = await _query({
            text: "SELECT * FROM " + tableName + " WHERE " + where_clause,
            values: vals
        });
        return result.rows;
    },
    selectAllRows : async function(tableName) {        
        let result = await _query(`SELECT * FROM ${tableName}`);
        return result.rows;
    },
};