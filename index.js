require("dotenv").config({ path: ".env.prod" });

const express = require("express");
const session = require("express-session");
const PgStore = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const securityMiddleware = require("./middlewares/securityMiddleware");
const csrfMiddleware = require("./middlewares/csrfMiddleware");
const { authMiddleware } = require("./middlewares/authMiddleware");
const adminRouter = require("./routes/adminRouter");
const authRouter = require("./routes/authRouter");

const db = require("./config/db");
const Admin = require("./models/User");
const AuthLog = require("./models/AuthLog");
const Category = require("./models/Category");
const Project = require("./models/Project");
const Sertifies = require("./models/Sertifies");
const Skills = require("./models/Skills");
const SocialNetwork = require("./models/SocialNetwork");

const app = express();
const PORT = process.env.PORT || 8001;

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

securityMiddleware(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    store: new PgStore({
        pool: db,
        tableName: "session",
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "change_me",
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
    },
}));

app.use(csrfMiddleware);

app.use((req, res, next) => {
    res.locals.req = req;
    res.locals.user = req.user || null;
    next();
});

app.use("/", authRouter);
app.use("/admin", authMiddleware, adminRouter);

app.use((req, res) => {
    res.status(404).render("error", {
        message: "Страница не найдена",
        error: null,
        layout: false,
    });
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).render("error", {
        message: "Ошибка сервера",
        error: err,
        layout: false,
    });
});

async function start() {
    try {
        await Admin.createTable();
        await AuthLog.createTable();
        await Category.createTable();
        await Project.createTable();
        await Sertifies.createTable();
        await Skills.createTable();
        await SocialNetwork.createTable();

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

start();
