const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'velocitycoach.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        throw err;
    }
    console.log('Connected to SQLite database');
});

// Promisify database operations
db.query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const method = sql.trim().toLowerCase().startsWith('select') ? 'all' : 'run';
        db[method](sql, params, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                rows: method === 'all' ? result : [],
                lastID: this.lastID,
                changes: this.changes
            });
        });
    });
};

module.exports = db;
