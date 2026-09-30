const Joi = require("joi");
const db = require("../config/db");

class Admin {
    constructor(id, name, password, createDate, updateDate) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.createDate = createDate;
        this.updateDate = updateDate;
    }

    static schema = Joi.object({
        id: Joi.string(),
        name: Joi.string().max(40).required().regex(/\S/),
        password: Joi.string().max(250).required().regex(/\S/),
    });

    static async createTable() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS admin (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    name VARCHAR(40) NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    createDate TIMESTAMP DEFAULT NOW(),
                    updateDate TIMESTAMP DEFAULT NOW()
                );
            `);
            console.log("createTable completed successfully");
        } catch (e) {
            console.log(e);
        }
    }

    static async findUserByName(name) {
        try {
            const users = await db.query("SELECT * FROM admin WHERE name = $1", [name]);
            return users.rows[0] || null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async findUserById(id) {
        try {
            const users = await db.query("SELECT * FROM admin WHERE id = $1", [id]);
            return users.rows[0] || null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async findById(id) {
        return Admin.findUserById(id);
    }
}

module.exports = Admin;
