const { Router } = require("express");
const AuthController = require("../controllers/AuthController");

const authRouter = Router();

authRouter.get("/", (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect("/admin");
    }

    return res.redirect("/login");
});

authRouter.get("/login", (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect("/admin");
    }

    res.render("auth/login", {
        error: null,
        name: "",
        layout: "layouts/auth"
    });
});

authRouter.post("/login", async (req, res) => {
    try {
        await AuthController.loginAdmin(req, res);
    } catch (error) {
        res.status(400).render("auth/login", {
            error: error.message,
            name: req.body.name || "",
            layout: false
        });
    }
});

authRouter.post("/logout", (req, res) => {
    AuthController.logoutAdmin(req, res);
});

module.exports = authRouter;
