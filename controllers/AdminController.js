const Project = require("../models/Project");
const Category = require("../models/Category");
const Sertifies = require("../models/Sertifies");
const Skills = require("../models/Skills");
const SocialNetwork = require("../models/SocialNetwork");
const AuthLog = require("../models/AuthLog");
const db = require("../config/db");
const { saveImage, deleteImage } = require("../utils/imageProcessor");

class AdminController {
    static async getDashboard(req, res) {
        try {
            const [
                projectsResult,
                categoriesResult,
                sertifiesResult,
                skillsResult,
                socialResult
            ] = await Promise.all([
                db.query("SELECT COUNT(*)::int AS count FROM project"),
                db.query("SELECT COUNT(*)::int AS count FROM category"),
                db.query("SELECT COUNT(*)::int AS count FROM sertefies"),
                db.query("SELECT COUNT(*)::int AS count FROM experience"),
                db.query("SELECT COUNT(*)::int AS count FROM social_network")
            ]);

            res.render("admin/dashboard", {
                counts: {
                    projects: projectsResult.rows[0].count,
                    categories: categoriesResult.rows[0].count,
                    sertifies: sertifiesResult.rows[0].count,
                    skills: skillsResult.rows[0].count,
                    social: socialResult.rows[0].count
                }
            });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки панели управления"
            });
        }
    }

    static async getProjects(req, res) {
        try {
            const projects = await Project.findAll();
            res.render("admin/projects", { projects });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки проектов"
            });
        }
    }

    static async getProjectForm(req, res) {
        try {
            const project = req.params.id
                ? await Project.findById(req.params.id)
                : null;

            const categories = await Category.findAll();

            res.render("admin/project-form", {
                project,
                categories
            });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки формы проекта"
            });
        }
    }

    static async saveProject(req, res) {
        try {
            const data = {
                name: req.body.name,
                deskription: req.body.deskription,
                short_deskription: req.body.short_deskription,
                site: req.body.site,
                importance: Number(req.body.importance)
            };

            const { error } = Project.schema.validate(data);

            if (error) {
                throw new Error(error.details[0].message);
            }

            if (req.params.id) {
                await Project.update(req.params.id, data);
            } else {
                await Project.create(data);
            }

            res.redirect("/admin/projects");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: e.message || "Ошибка сохранения проекта"
            });
        }
    }

    static async deleteProject(req, res) {
        try {
            await Project.delete(req.params.id);
            res.redirect("/admin/projects");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка удаления проекта"
            });
        }
    }

    static async getCategories(req, res) {
        try {
            const categories = await Category.findAll();
            res.render("admin/categories", { categories });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки категорий"
            });
        }
    }

    static async getCategoryForm(req, res) {
        try {
            const category = req.params.id
                ? await Category.findById(req.params.id)
                : null;

            res.render("admin/category-form", {
                category
            });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки формы категории"
            });
        }
    }

    static async saveCategory(req, res) {
        try {
            const data = {
                name: req.body.name,
                onHide: req.body.onHide === "on"
            };

            const { error } = Category.schema.validate(data);

            if (error) {
                throw new Error(error.details[0].message);
            }

            if (req.params.id) {
                await Category.update(req.params.id, data);
            } else {
                await Category.create(data);
            }

            res.redirect("/admin/categories");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: e.message || "Ошибка сохранения категории"
            });
        }
    }

    static async deleteCategory(req, res) {
        try {
            await Category.delete(req.params.id);
            res.redirect("/admin/categories");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка удаления категории"
            });
        }
    }

    static async getSertifies(req, res) {
        try {
            const sertifies = await Sertifies.findAll();
            res.render("admin/sertifies", { sertifies });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки сертификатов"
            });
        }
    }

    static async getSertifiesForm(req, res) {
        try {
            const sertify = req.params.id
                ? await Sertifies.findById(req.params.id)
                : null;

            res.render("admin/sertifies-form", {
                sertify
            });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки формы сертификата"
            });
        }
    }

    static async saveSertifies(req, res) {
        try {
            const current = req.params.id
                ? await Sertifies.findById(req.params.id)
                : null;

            let photo = current ? current.photo : "";

            if (req.file) {
                photo = await saveImage(
                    req.file.buffer,
                    "sertifies",
                    3508,
                    2481
                );
            }

            const data = {
                name: req.body.name,
                site: req.body.site || "",
                photo
            };

            const { error } = Sertifies.schema.validate(data);

            if (error) {
                if (req.file) {
                    await deleteImage(photo);
                }

                throw new Error(error.details[0].message);
            }

            if (!photo) {
                throw new Error("Необходимо загрузить изображение сертификата");
            }

            if (req.params.id) {
                await Sertifies.update(req.params.id, data);

                if (
                    req.file &&
                    current &&
                    current.photo &&
                    current.photo !== photo
                ) {
                    await deleteImage(current.photo);
                }
            } else {
                await Sertifies.create(data);
            }

            res.redirect("/admin/sertifies");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: e.message || "Ошибка сохранения сертификата"
            });
        }
    }

    static async deleteSertifies(req, res) {
        try {
            const sertify = await Sertifies.findById(req.params.id);

            await Sertifies.delete(req.params.id);

            if (sertify && sertify.photo) {
                await deleteImage(sertify.photo);
            }

            res.redirect("/admin/sertifies");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка удаления сертификата"
            });
        }
    }

    static async getSkills(req, res) {
        try {
            const skills = await Skills.findAll();
            res.render("admin/skills", { skills });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки навыков"
            });
        }
    }

    static async getSkillForm(req, res) {
        try {
            const skill = req.params.id
                ? await Skills.findById(req.params.id)
                : null;

            const categories = await Skills.findCategories();

            res.render("admin/skills-form", {
                skill,
                categories
            });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки навыка"
            });
        }
    }

    static async saveSkill(req, res) {
        try {
            const data = {
                name: req.body.name,
                categoryId: Number(req.body.categoryId),
                importance: Number(req.body.importance)
            };

            const { error } = Skills.schema.validate(data);

            if (error) {
                throw new Error(error.details[0].message);
            }

            if (req.params.id) {
                await Skills.update(req.params.id, data);
            } else {
                await Skills.create(data);
            }

            res.redirect("/admin/skills");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: e.message || "Ошибка сохранения навыка"
            });
        }
    }

    static async deleteSkill(req, res) {
        try {
            await Skills.delete(req.params.id);
            res.redirect("/admin/skills");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка удаления навыка"
            });
        }
    }

    static async getSocial(req, res) {
        try {
            const social = await SocialNetwork.findAll();
            res.render("admin/social", { social });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки социальных сетей"
            });
        }
    }

    static async getSocialForm(req, res) {
        try {
            const socialNetwork = req.params.id
                ? await SocialNetwork.findById(req.params.id)
                : null;

            res.render("admin/social-form", {
                socialNetwork
            });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки социальной сети"
            });
        }
    }

    static async saveSocial(req, res) {
        try {
            const current = req.params.id
                ? await SocialNetwork.findById(req.params.id)
                : null;

            let photo = current ? current.photo : "";

            if (req.file) {
                photo = await saveImage(
                    req.file.buffer,
                    "social",
                    200,
                    200
                );
            }

            const data = {
                name: req.body.name,
                site: req.body.site || "",
                photo
            };

            const { error } = SocialNetwork.schema.validate(data);

            if (error) {
                if (req.file) {
                    await deleteImage(photo);
                }

                throw new Error(error.details[0].message);
            }

            if (req.params.id) {
                await SocialNetwork.update(req.params.id, data);

                if (
                    req.file &&
                    current &&
                    current.photo &&
                    current.photo !== photo
                ) {
                    await deleteImage(current.photo);
                }
            } else {
                await SocialNetwork.create(data);
            }

            res.redirect("/admin/social");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: e.message || "Ошибка сохранения социальной сети"
            });
        }
    }

    static async deleteSocial(req, res) {
        try {
            const socialNetwork = await SocialNetwork.findById(req.params.id);

            await SocialNetwork.delete(req.params.id);

            if (socialNetwork && socialNetwork.photo) {
                await deleteImage(socialNetwork.photo);
            }

            res.redirect("/admin/social");
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка удаления социальной сети"
            });
        }
    }

    static async getAuthLog(req, res) {
        try {
            const logs = await AuthLog.findAll();
            res.render("admin/auth-log", { logs });
        } catch (e) {
            console.log(e);
            res.status(500).render("error", {
                message: "Ошибка загрузки истории входов"
            });
        }
    }
}

module.exports = AdminController;
