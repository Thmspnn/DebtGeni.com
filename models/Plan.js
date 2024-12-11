const db = require('../config/database');

class Plan {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.interval = data.interval;
    this.description = data.description;
    this.active = data.active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create({ name, price, interval, description }) {
    const result = await db.query(
      `INSERT INTO plans (name, price, interval, description, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [name, price, interval, description, true]
    );
    return result.rows[0].id;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT * FROM plans WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? new Plan(result.rows[0]) : null;
  }

  static async findAll(active = true) {
    const result = await db.query(
      `SELECT * FROM plans WHERE active = $1`,
      [active]
    );
    return result.rows.map(row => new Plan(row));
  }

  async update(data) {
    const result = await db.query(
      `UPDATE plans 
       SET name = $1, price = $2, interval = $3, description = $4, active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [data.name || this.name, 
       data.price || this.price,
       data.interval || this.interval,
       data.description || this.description,
       data.active !== undefined ? data.active : this.active,
       this.id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  async delete() {
    await db.query(
      `DELETE FROM plans WHERE id = $1`,
      [this.id]
    );
  }

  async getFeatures() {
    const result = await db.query(
      `SELECT f.*, pf.access_level
       FROM features f
       JOIN plan_features pf ON f.id = pf.feature_id
       WHERE pf.plan_id = $1`,
      [this.id]
    );
    return result.rows;
  }
}

module.exports = Plan;
