const bcrypt = require('bcryptjs');
const db = require('../database/init');
const crypto = require('crypto');

class User {
    constructor(data) {
        this.id = data.id;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.email = data.email;
        this.password = data.password;
        this.province = data.province;
        this.isAdmin = data.is_admin === 1;
        this.resetToken = data.reset_token;
        this.resetTokenExpiry = data.reset_token_expiry;
        this.subscriptionPlanId = data.subscription_plan_id;
        this.trialEnds = data.trial_ends;
    }

    static async create({ firstName, lastName, email, password, province, isAdmin = false }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            const result = await db.run(
                `INSERT INTO users (first_name, last_name, email, password, province, is_admin)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, email, hashedPassword, province, isAdmin ? 1 : 0]
            );
            return result.lastID;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const result = await db.query(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return result.rows[0] ? new User(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const result = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return result.rows[0] ? new User(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async comparePassword(candidatePassword) {
        try {
            return bcrypt.compare(candidatePassword, this.password);
        } catch (error) {
            console.error('Error comparing passwords:', error);
            throw error;
        }
    }

    async createPasswordResetToken() {
        try {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            await db.run(
                `UPDATE users 
                 SET reset_token = ?, reset_token_expiry = ?
                 WHERE id = ?`,
                [hashedToken, expiryDate.toISOString(), this.id]
            );

            return resetToken;
        } catch (error) {
            console.error('Error creating reset token:', error);
            throw error;
        }
    }

    static async findByResetToken(token) {
        try {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const result = await db.query(
                `SELECT * FROM users 
                 WHERE reset_token = ? 
                 AND reset_token_expiry > datetime('now')`,
                [hashedToken]
            );
            return result.rows[0] ? new User(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding user by reset token:', error);
            throw error;
        }
    }

    async resetPassword(newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await db.run(
                `UPDATE users 
                 SET password = ?, reset_token = NULL, reset_token_expiry = NULL
                 WHERE id = ?`,
                [hashedPassword, this.id]
            );
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }

    async isTrialExpired() {
        try {
            const result = await db.query(
                'SELECT trial_ends FROM users WHERE id = ?',
                [this.id]
            );
            if (!result.rows[0]?.trial_ends) return true;
            return new Date(result.rows[0].trial_ends) < new Date();
        } catch (error) {
            console.error('Error checking trial expiry:', error);
            throw error;
        }
    }

    async canAccessFeature(featureKey) {
        try {
            const result = await db.query(
                `SELECT f.*, pf.access_type
                 FROM features f
                 JOIN plan_features pf ON f.id = pf.feature_id
                 JOIN users u ON u.subscription_plan_id = pf.plan_id
                 WHERE u.id = ? AND f.key = ?`,
                [this.id, featureKey]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking feature access:', error);
            throw error;
        }
    }
}

module.exports = User;