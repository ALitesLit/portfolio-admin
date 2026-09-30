const Joi = require("joi");
const db = require("../config/db");

class Skills {
    constructor(id, name, categoryId, importance, categoryName) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.importance = importance;
        this.categoryName = categoryName;
    }

    static schema = Joi.object({
        id: Joi.number().integer().optional(),
        name: Joi.string().max(255).required().regex(/\S/),
        categoryId: Joi.number().integer().required(),
        importance: Joi.number().integer().min(0).required()
    });

    static async createTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS skill_category (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS experience (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category_id INTEGER NOT NULL REFERENCES skill_category(id),
                importance INTEGER NOT NULL DEFAULT 0
            )
        `);

        console.log("Table skill_category ready");
        console.log("Table experience ready");
    }

    static async findAll() {
        const result = await db.query(`
            SELECT
                e.id,
                e.name,
                e.category_id,
                e.importance,
                sc.name AS category_name
            FROM experience e
            LEFT JOIN skill_category sc ON sc.id = e.category_id
            ORDER BY e.importance ASC, e.id ASC
        `);

        return result.rows;
    }

    static async findById(id) {
        const result = await db.query(`
            SELECT
                e.id,
                e.name,
                e.category_id,
                e.importance,
                sc.name AS category_name
            FROM experience e
            LEFT JOIN skill_category sc ON sc.id = e.category_id
            WHERE e.id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async findCategories() {
        const result = await db.query(
            "SELECT id, name FROM skill_category ORDER BY id ASC"
        );

        return result.rows;
    }

    static async create(data) {
        const result = await db.query(
            "INSERT INTO experience (name, category_id, importance) VALUES ($1, $2, $3) RETURNING *",
            [data.name, data.categoryId, data.importance]
        );

        return result.rows[0];
    }

    static async update(id, data) {
        const result = await db.query(
            "UPDATE experience SET name = $1, category_id = $2, importance = $3 WHERE id = $4 RETURNING *",
            [data.name, data.categoryId, data.importance, id]
        );

        return result.rows[0];
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM experience WHERE id = $1",
            [id]
        );
    }
}

module.exports = Skills;
