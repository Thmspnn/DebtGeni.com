const db = require('../config/database');

class Feature {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.key = data.key;
    this.description = data.description;
    this.category = data.category;
    this.active = data.active;
    this.limited_access_max = data.limited_access_max;
    this.limited_access_timeframe = data.limited_access_timeframe;
    this.limited_access_description = data.limited_access_description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create({ name, key, description, category, limitedAccess }) {
    const result = await db.query(
      `INSERT INTO features (
        name, key, description, category, active,
        limited_access_max, limited_access_timeframe, limited_access_description,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        name, key, description, category, true,
        limitedAccess?.maxUsage,
        limitedAccess?.timeFrame,
        limitedAccess?.description
      ]
    );
    return result.rows[0].id;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT * FROM features WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? new Feature(result.rows[0]) : null;
  }

  static async findByKey(key) {
    const result = await db.query(
      `SELECT * FROM features WHERE key = $1`,
      [key]
    );
    return result.rows[0] ? new Feature(result.rows[0]) : null;
  }

  static async findAll(active = true) {
    const result = await db.query(
      `SELECT * FROM features WHERE active = $1`,
      [active]
    );
    return result.rows.map(row => new Feature(row));
  }

  async update(data) {
    const result = await db.query(
      `UPDATE features 
       SET name = $1, key = $2, description = $3, category = $4,
           active = $5, limited_access_max = $6,
           limited_access_timeframe = $7, limited_access_description = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        data.name || this.name,
        data.key || this.key,
        data.description || this.description,
        data.category || this.category,
        data.active !== undefined ? data.active : this.active,
        data.limitedAccess?.maxUsage || this.limited_access_max,
        data.limitedAccess?.timeFrame || this.limited_access_timeframe,
        data.limitedAccess?.description || this.limited_access_description,
        this.id
      ]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  async delete() {
    await db.query(
      `DELETE FROM features WHERE id = $1`,
      [this.id]
    );
  }
}

module.exports = Feature;
