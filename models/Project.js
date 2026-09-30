const Joi = require("joi");
const db = require("../config/db");

class Project {
    static schema = Joi.object({
        id: Joi.number().integer().optional(),
        name: Joi.string().max(255).required().regex(/\S/),
        deskription: Joi.string().allow("").default(""),
        short_deskription: Joi.string().allow("").default(""),
        site: Joi.string().uri({
            scheme: ["http", "https"]
        }).allow(""),
        importance: Joi.number().integer().default(0),
        categoryId: Joi.number().integer().allow(null)
    });

    static async createTable() {
        await db.query("SELECT 1 FROM project LIMIT 1");
        console.log("Table project ready");
    }

    static async findAll() {
        const result = await db.query(`
            SELECT
                p.id,
                p.name,
                p.deskription,
                p.short_deskription,
                p.site,
                p.importance,
                COALESCE(
                    STRING_AGG(c.name, ', ' ORDER BY c.name),
                    ''
                ) AS "categoryName"
            FROM project p
            LEFT JOIN project_category pc
                ON pc.project_id = p.id
            LEFT JOIN category c
                ON c.id = pc.category_id
            GROUP BY
                p.id,
                p.name,
                p.deskription,
                p.short_deskription,
                p.site,
                p.importance
            ORDER BY p.importance DESC, p.id DESC
        `);

        return result.rows;
    }

    static async findById(id) {
        const result = await db.query(`
            SELECT
                p.id,
                p.name,
                p.deskription,
                p.short_deskription,
                p.site,
                p.importance,
                MIN(pc.category_id) AS "categoryId"
            FROM project p
            LEFT JOIN project_category pc
                ON pc.project_id = p.id
            WHERE p.id = $1
            GROUP BY
                p.id,
                p.name,
                p.deskription,
                p.short_deskription,
                p.site,
                p.importance
        `, [id]);

        return result.rows[0] || null;
    }

    static async create(data) {
        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const projectResult = await client.query(`
                INSERT INTO project (
                    name,
                    deskription,
                    short_deskription,
                    site,
                    importance
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [
                data.name,
                data.deskription || null,
                data.short_deskription || null,
                data.site || null,
                data.importance || 0
            ]);

            const project = projectResult.rows[0];

            if (data.categoryId !== null && data.categoryId !== undefined) {
                await client.query(`
                    INSERT INTO project_category (
                        project_id,
                        category_id
                    )
                    VALUES ($1, $2)
                `, [
                    project.id,
                    data.categoryId
                ]);
            }

            await client.query("COMMIT");

            return project;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async update(id, data) {
        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const projectResult = await client.query(`
                UPDATE project
                SET
                    name = $1,
                    deskription = $2,
                    short_deskription = $3,
                    site = $4,
                    importance = $5
                WHERE id = $6
                RETURNING *
            `, [
                data.name,
                data.deskription || null,
                data.short_deskription || null,
                data.site || null,
                data.importance || 0,
                id
            ]);

            await client.query(
                "DELETE FROM project_category WHERE project_id = $1",
                [id]
            );

            if (data.categoryId !== null && data.categoryId !== undefined) {
                await client.query(`
                    INSERT INTO project_category (
                        project_id,
                        category_id
                    )
                    VALUES ($1, $2)
                `, [
                    id,
                    data.categoryId
                ]);
            }

            await client.query("COMMIT");

            return projectResult.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM project WHERE id = $1",
            [id]
        );
    }
}

module.exports = Project;
