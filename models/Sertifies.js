const Joi = require("joi");
const db = require("../config/db");

class Sertifies {
    constructor(id, name, site, photo) {
        this.id = id;
        this.name = name;
        this.site = site;
        this.photo = photo;
    }

    static schema = Joi.object({
        id: Joi.number().integer().optional(),
        name: Joi.string().max(255).required().regex(/\S/),
        site: Joi.string().uri({
            scheme: ["http", "https"]
        }).allow(""),
        photo: Joi.string().max(500).required()
    });

    static async createTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS sertefies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                site VARCHAR(500),
                photo VARCHAR(500)
            )
        `);

        console.log("Table sertefies ready");
    }

    static async findAll() {
        const result = await db.query(
            "SELECT id, name, site, photo FROM sertefies ORDER BY id DESC"
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await db.query(
            "SELECT id, name, site, photo FROM sertefies WHERE id = $1",
            [id]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, site, photo } = data;

        const result = await db.query(
            "INSERT INTO sertefies (name, site, photo) VALUES ($1, $2, $3) RETURNING id, name, site, photo",
            [name, site || null, photo]
        );

        return result.rows[0];
    }

    static async update(id, data) {
        const { name, site, photo } = data;

        const result = await db.query(
            "UPDATE sertefies SET name = $1, site = $2, photo = $3 WHERE id = $4 RETURNING id, name, site, photo",
            [name, site || null, photo, id]
        );

        return result.rows[0];
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM sertefies WHERE id = $1",
            [id]
        );
    }
}

module.exports = Sertifies;
