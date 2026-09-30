const crypto = require("crypto");

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

function csrfMiddleware(req, res, next) {
    if (!req.session) {
        return next(new Error("Session required for CSRF"));
    }

    if (SAFE_METHODS.includes(req.method)) {
        if (!req.session.csrfToken) {
            req.session.csrfToken = crypto.randomBytes(32).toString("hex");
        }

        res.locals.csrfToken = req.session.csrfToken;

        return req.session.save((err) => {
            if (err) {
                console.log("Session save error:", err);
                return next(err);
            }

            next();
        });
    }

    const sessionToken = req.session.csrfToken;
    const tokenFromBody = req.body && req.body._csrf;
    const tokenFromHeader = req.headers["x-csrf-token"];
    const token = tokenFromBody || tokenFromHeader;

    res.locals.csrfToken = sessionToken || "";

    const valid =
        typeof sessionToken === "string" &&
        sessionToken.length > 0 &&
        typeof token === "string" &&
        token.length > 0 &&
        token.length === sessionToken.length &&
        crypto.timingSafeEqual(
            Buffer.from(token),
            Buffer.from(sessionToken)
        );

    if (!valid) {
        console.log("CSRF mismatch:", req.method, req.originalUrl, req.ip, {
            hasToken: !!token,
            sessionToken: sessionToken ? "set" : "empty",
            cookieHeader: req.headers.cookie ? "yes" : "no",
            sid: req.sessionID ? req.sessionID.slice(0, 8) + "..." : "none",
        });

        return res.status(403).render("error", {
            message: "Ошибка CSRF-токена. Обновите страницу и попробуйте снова.",
            error: null,
            layout: false,
        });
    }

    next();
}

module.exports = csrfMiddleware;
