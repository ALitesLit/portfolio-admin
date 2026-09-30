const User = require("../models/User");
const UserResponse = require("../models/response/UserResponse");

const authMiddleware = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        if (req.path === "/login" || req.path === "/auth/login") {
            return next();
        }
        return res.redirect("/login");
    }

    try {
        const user = await User.findUserById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect("/login");
        }
        req.user = new UserResponse(user);
        res.locals.user = req.user;
        next();
    } catch (err) {
        console.log(err);
        res.redirect("/login");
    }
};

const optionalAuth = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findUserById(req.session.userId);
            if (user) {
                req.user = new UserResponse(user);
                res.locals.user = req.user;
            }
        } catch (err) {
            console.log(err);
        }
    }
    next();
};

module.exports = { authMiddleware, optionalAuth };
