const Joi = require("joi");
const db = require("../config/db");

class Category {
    constructor(id, name, onHide) {
        this.id = id;
        this.name = name;
        this.onHide = onHide;
    }

    static schema = Joi.object({
        id: Joi.number().integer().optional(),
        name: Joi.string().max(255).required().regex(/\S/),
        onHide: Joi.boolean().default(false)
    });

    static async createTable() {
        await db.query("SELECT 1 FROM category LIMIT 1");
        console.log("Table category ready");
    }

    static async findAll() {
        const result = await db.query(`
            SELECT
                id,
                name,
                on_hide AS "onHide"
            FROM category
            ORDER BY id DESC
        `);

        return result.rows;
    }

    static async findById(id) {
        const result = await db.query(`
            SELECT
                id,
                name,
                on_hide AS "onHide"
            FROM category
            WHERE id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async create(data) {
        const result = await db.query(`
            INSERT INTO category (name, on_hide)
            VALUES ($1, $2)
            RETURNING id, name, on_hide AS "onHide"
        `, [
            data.name,
            data.onHide
        ]);

        return result.rows[0];
    }

    static async update(id, data) {
        const result = await db.query(`
            UPDATE category
            SET name = $1,
                on_hide = $2
            WHERE id = $3
            RETURNING id, name, on_hide AS "onHide"
        `, [
            data.name,
            data.onHide,
            id
        ]);

        return result.rows[0];
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM category WHERE id = $1",
            [id]
        );
    }
}

module.exports = Category;
