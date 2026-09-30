const Joi = require("joi");
const db = require("../config/db");

class SocialNetwork {
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
        photo: Joi.string().max(500).allow("")
    });

    static async createTable() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS social_network (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    site VARCHAR(500),
                    photo VARCHAR(500)
                );
            `);

            console.log("Table social_network ready");
        } catch (e) {
            console.log(e);
        }
    }

    static async findAll() {
        const result = await db.query(
            "SELECT * FROM social_network ORDER BY id DESC"
        );

        return result.rows;
    }

    static async findById(id) {
        const result = await db.query(
            "SELECT * FROM social_network WHERE id = $1",
            [id]
        );

        return result.rows[0] || null;
    }

    static async create(data) {
        const {
            name,
            site,
            photo
        } = data;

        const result = await db.query(
            "INSERT INTO social_network (name, site, photo) VALUES ($1, $2, $3) RETURNING *",
            [
                name,
                site || null,
                photo || null
            ]
        );

        return result.rows[0];
    }

    static async update(id, data) {
        const {
            name,
            site,
            photo
        } = data;

        const result = await db.query(
            "UPDATE social_network SET name = $1, site = $2, photo = $3 WHERE id = $4 RETURNING *",
            [
                name,
                site || null,
                photo || null,
                id
            ]
        );

        return result.rows[0];
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM social_network WHERE id = $1",
            [id]
        );
    }
}

module.exports = SocialNetwork;
