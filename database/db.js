const db = require('./init');

// Promisify database operations
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// User operations
async function createUser(userData) {
    const { firstName, lastName, email, password, province } = userData;
    const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days

    const result = await run(
        `INSERT INTO users (firstName, lastName, email, password, province, trial_ends)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, password, province, trialEnds]
    );
    
    return getUserById(result.lastID);
}

async function getUserById(id) {
    return await get('SELECT * FROM users WHERE id = ?', [id]);
}

async function getUserByEmail(email) {
    return await get('SELECT * FROM users WHERE email = ?', [email]);
}

// Plan operations
async function getAllPlans() {
    const plans = await all('SELECT * FROM plans WHERE active = 1');
    
    // Get features for each plan
    for (const plan of plans) {
        plan.features = await all(`
            SELECT f.*, pf.access_type
            FROM features f
            JOIN plan_features pf ON f.id = pf.feature_id
            WHERE pf.plan_id = ? AND f.active = 1
        `, [plan.id]);
    }
    
    return plans;
}

async function getPlanById(id) {
    const plan = await get('SELECT * FROM plans WHERE id = ?', [id]);
    if (!plan) return null;
    
    plan.features = await all(`
        SELECT f.*, pf.access_type
        FROM features f
        JOIN plan_features pf ON f.id = pf.feature_id
        WHERE pf.plan_id = ? AND f.active = 1
    `, [id]);
    
    return plan;
}

// Feature operations
async function getAllFeatures() {
    const features = await all('SELECT * FROM features WHERE active = 1');
    
    // Get limits for each feature
    for (const feature of features) {
        feature.limits = await get(
            'SELECT * FROM feature_limits WHERE feature_id = ?',
            [feature.id]
        );
    }
    
    return features;
}

async function getFeatureByKey(key) {
    const feature = await get('SELECT * FROM features WHERE key = ?', [key]);
    if (!feature) return null;
    
    feature.limits = await get(
        'SELECT * FROM feature_limits WHERE feature_id = ?',
        [feature.id]
    );
    
    return feature;
}

// Feature usage operations
async function recordFeatureUsage(userId, featureKey) {
    const feature = await getFeatureByKey(featureKey);
    if (!feature) throw new Error('Feature not found');
    
    const now = new Date().toISOString();
    
    await run(`
        INSERT INTO feature_usage (user_id, feature_id, count, last_reset)
        VALUES (?, ?, 1, ?)
        ON CONFLICT(user_id, feature_id) DO UPDATE SET
        count = count + 1,
        last_reset = CASE
            WHEN (
                (time_frame = 'daily' AND date(last_reset) != date(?)) OR
                (time_frame = 'weekly' AND julianday(?) - julianday(last_reset) >= 7) OR
                (time_frame = 'monthly' AND strftime('%Y-%m', last_reset) != strftime('%Y-%m', ?))
            )
            THEN ?
            ELSE last_reset
        END
    `, [userId, feature.id, now, now, now, now, now]);
    
    return await get(
        'SELECT * FROM feature_usage WHERE user_id = ? AND feature_id = ?',
        [userId, feature.id]
    );
}

async function getFeatureUsage(userId, featureKey) {
    const feature = await getFeatureByKey(featureKey);
    if (!feature) throw new Error('Feature not found');
    
    return await get(
        'SELECT * FROM feature_usage WHERE user_id = ? AND feature_id = ?',
        [userId, feature.id]
    );
}

module.exports = {
    run,
    get,
    all,
    createUser,
    getUserById,
    getUserByEmail,
    getAllPlans,
    getPlanById,
    getAllFeatures,
    getFeatureByKey,
    recordFeatureUsage,
    getFeatureUsage
};
