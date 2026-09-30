const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const securityMiddleware = (app) => {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "cdn.jsdelivr.net"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "cdn.jsdelivr.net",
                    "fonts.googleapis.com"
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "http:",
                    "https:"
                ],
                fontSrc: [
                    "'self'",
                    "cdn.jsdelivr.net",
                    "fonts.gstatic.com"
                ],
            },
        },
        crossOriginEmbedderPolicy: false,
        frameguard: { action: "deny" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        noSniff: true,
    }));

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        message: "Too many requests, please try again later",
        standardHeaders: true,
        legacyHeaders: false,
    }));

    app.use("/login", rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: "Too many login attempts, please try again later",
        standardHeaders: true,
        legacyHeaders: false,
    }));
};

module.exports = securityMiddleware;
