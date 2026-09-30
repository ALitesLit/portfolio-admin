const crypto = require("crypto");
const Admin = require("../models/User");
const AdminResponse = require("../models/response/UserResponse");
const AuthLog = require("../models/AuthLog");
const ValidateException = require("../exceptions/ValidateException");
const bcrypt = require("bcryptjs");

class AuthController {
    static async loginAdmin(req, res) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers["user-agent"] || "";

        try {
            const { name, password } = req.body;

            const { error } = Admin.schema.validate({
                name,
                password,
            });

            if (error) {
                throw new ValidateException(error.details[0].message);
            }

            const admin = await Admin.findUserByName(name);

            if (!admin) {
                await AuthLog.log({
                    name,
                    ip,
                    userAgent,
                    success: false,
                    reason: "Пользователь не найден",
                });

                throw new ValidateException(
                    "Неверное имя пользователя или пароль"
                );
            }

            const isValid = await bcrypt.compare(password, admin.password);

            if (!isValid) {
                await AuthLog.log({
                    name,
                    ip,
                    userAgent,
                    success: false,
                    reason: "Неверный пароль",
                });

                throw new ValidateException(
                    "Неверное имя пользователя или пароль"
                );
            }

            await AuthLog.log({
                name,
                ip,
                userAgent,
                success: true,
                reason: null,
            });

            req.session.regenerate((err) => {
                if (err) {
                    console.log(err);

                    return res.status(500).render("auth/login", {
                        error: "Ошибка сервера",
                        name: req.body.name || "",
                        layout: "layouts/auth",
                    });
                }

                req.session.userId = admin.id;
                req.session.userName = admin.name;
                req.session.csrfToken = crypto.randomBytes(32).toString("hex");

                req.session.save((err2) => {
                    if (err2) {
                        console.log(err2);

                        return res.status(500).render("auth/login", {
                            error: "Ошибка сервера",
                            name: req.body.name || "",
                            layout: "layouts/auth",
                        });
                    }

                    res.redirect("/admin");
                });
            });
        } catch (error) {
            if (error instanceof ValidateException) {
                return res.status(400).render("auth/login", {
                    error: error.message,
                    name: req.body.name || "",
                    layout: "layouts/auth",
                });
            }

            console.log(error);

            res.status(500).render("auth/login", {
                error: "Ошибка сервера",
                name: req.body.name || "",
                layout: "layouts/auth",
            });
        }
    }

    static async logoutAdmin(req, res) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers["user-agent"] || "";
        const name = req.session && req.session.userName
            ? req.session.userName
            : null;

        if (name) {
            await AuthLog.log({
                name,
                ip,
                userAgent,
                success: true,
                reason: "Выход",
            });
        }

        req.session.destroy((err) => {
            if (err) {
                console.log(err);

                return res.status(400).render("error", {
                    message: "Ошибка при выходе",
                    error: err,
                    layout: false,
                });
            }

            res.clearCookie("connect.sid");
            res.redirect("/login");
        });
    }

    static async updateToken(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                throw new ValidateException("Пользователь не авторизован");
            }

            const admin = await Admin.findUserById(req.session.userId);

            if (!admin) {
                throw new ValidateException("Пользователь не найден");
            }

            req.session.touch();

            res.status(200).json({
                message: "Токен обновлен",
                user: new AdminResponse(admin),
            });
        } catch (error) {
            if (error instanceof ValidateException) {
                return res.status(400).json({
                    error: error.message,
                });
            }

            console.log(error);

            res.status(500).json({
                error: "Ошибка сервера",
            });
        }
    }
}

module.exports = AuthController;
