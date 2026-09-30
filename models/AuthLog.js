const db = require("../config/db");

class AuthLog {
    static async createTable() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS auth_log (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(40),
                    ip VARCHAR(64),
                    userAgent TEXT,
                    success BOOLEAN NOT NULL,
                    reason VARCHAR(200),
                    created TIMESTAMP DEFAULT NOW()
                );
            `);
            console.log("Table auth_log ready");
        } catch (e) {
            console.log(e);
        }
    }

    static async log({ name, ip, userAgent, success, reason }) {
        try {
            await db.query(
                `INSERT INTO auth_log (name, ip, userAgent, success, reason)
                 VALUES ($1, $2, $3, $4, $5)`,
                [name || null, ip || null, userAgent || null, success, reason || null]
            );
        } catch (e) {
            console.log("AuthLog error:", e);
        }
    }

    static async findAll(limit = 200) {
        const result = await db.query(
            "SELECT * FROM auth_log ORDER BY created DESC LIMIT $1",
            [limit]
        );
        return result.rows;
    }
}

module.exports = AuthLog;
