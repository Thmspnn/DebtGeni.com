const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(async () => {
    // Drop existing tables if they exist
    db.run('DROP TABLE IF EXISTS plan_features');
    db.run('DROP TABLE IF EXISTS features');
    db.run('DROP TABLE IF EXISTS plans');
    db.run('DROP TABLE IF EXISTS users');

    // Create users table
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            province TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            reset_token TEXT,
            reset_token_expiry DATETIME,
            subscription_plan_id INTEGER,
            trial_ends DATETIME DEFAULT (datetime('now', '+30 days')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subscription_plan_id) REFERENCES plans (id)
        )
    `);

    // Create plans table
    db.run(`
        CREATE TABLE plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create features table
    db.run(`
        CREATE TABLE features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            key TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create plan_features table
    db.run(`
        CREATE TABLE plan_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            feature_id INTEGER NOT NULL,
            access_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (plan_id) REFERENCES plans (id),
            FOREIGN KEY (feature_id) REFERENCES features (id)
        )
    `);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    db.run(`
        INSERT INTO users (
            first_name,
            last_name,
            email,
            password,
            province,
            is_admin,
            trial_ends
        )
        VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+365 days'))
    `, ['Admin', 'User', 'admin@debtgeni.com', adminPassword, 'BC', 1]);

    // Insert default plans
    db.run(`
        INSERT INTO plans (name, price, description)
        VALUES 
        ('Free', 0, 'Basic debt management features'),
        ('Premium', 9.99, 'Advanced debt management with analytics'),
        ('Enterprise', 29.99, 'Full suite of debt management tools')
    `);

    // Insert default features
    db.run(`
        INSERT INTO features (name, key, description)
        VALUES 
        ('Debt Tracking', 'debt_tracking', 'Track multiple debts'),
        ('Payment Reminders', 'payment_reminders', 'Get payment reminders'),
        ('Debt Analytics', 'debt_analytics', 'Advanced debt analytics'),
        ('Export Reports', 'export_reports', 'Export detailed reports')
    `);

    // Associate features with plans
    db.run(`
        INSERT INTO plan_features (plan_id, feature_id, access_type)
        SELECT 1, id, 'full' FROM features WHERE key = 'debt_tracking'
        UNION ALL
        SELECT 2, id, 'full' FROM features WHERE key IN ('debt_tracking', 'payment_reminders', 'debt_analytics')
        UNION ALL
        SELECT 3, id, 'full' FROM features
    `);
});

// Export the database connection
module.exports = {
    query: (text, params) => {
        return new Promise((resolve, reject) => {
            db.all(text, params, (err, rows) => {
                if (err) reject(err);
                resolve({ rows });
            });
        });
    },
    run: (text, params) => {
        return new Promise((resolve, reject) => {
            db.run(text, params, function(err) {
                if (err) reject(err);
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
};
