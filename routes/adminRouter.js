const express = require("express");
const AdminController = require("../controllers/AdminController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const csrfMiddleware = require("../middlewares/csrfMiddleware");
const {
    uploadPhoto
} = require("../middlewares/imageUpload");

const adminRouter = express.Router();

adminRouter.use(authMiddleware);

adminRouter.get("/", csrfMiddleware, (req, res) => {
    AdminController.getDashboard(req, res);
});

adminRouter.get("/projects", csrfMiddleware, (req, res) => {
    AdminController.getProjects(req, res);
});

adminRouter.get("/projects/new", csrfMiddleware, (req, res) => {
    AdminController.getProjectForm(req, res);
});

adminRouter.get("/projects/:id/edit", csrfMiddleware, (req, res) => {
    AdminController.getProjectForm(req, res);
});

adminRouter.post("/projects/new", csrfMiddleware, (req, res) => {
    AdminController.saveProject(req, res);
});

adminRouter.post("/projects/:id", csrfMiddleware, (req, res) => {
    AdminController.saveProject(req, res);
});

adminRouter.post("/projects/:id/delete", csrfMiddleware, (req, res) => {
    AdminController.deleteProject(req, res);
});

adminRouter.get("/categories", csrfMiddleware, (req, res) => {
    AdminController.getCategories(req, res);
});

adminRouter.get("/categories/new", csrfMiddleware, (req, res) => {
    AdminController.getCategoryForm(req, res);
});

adminRouter.get("/categories/:id/edit", csrfMiddleware, (req, res) => {
    AdminController.getCategoryForm(req, res);
});

adminRouter.post("/categories/new", csrfMiddleware, (req, res) => {
    AdminController.saveCategory(req, res);
});

adminRouter.post("/categories/:id", csrfMiddleware, (req, res) => {
    AdminController.saveCategory(req, res);
});

adminRouter.post("/categories/:id/delete", csrfMiddleware, (req, res) => {
    AdminController.deleteCategory(req, res);
});

adminRouter.get("/sertifies", csrfMiddleware, (req, res) => {
    AdminController.getSertifies(req, res);
});

adminRouter.get("/sertifies/new", csrfMiddleware, (req, res) => {
    AdminController.getSertifiesForm(req, res);
});

adminRouter.get("/sertifies/:id/edit", csrfMiddleware, (req, res) => {
    AdminController.getSertifiesForm(req, res);
});

adminRouter.post("/sertifies/new", uploadPhoto, csrfMiddleware, (req, res) => {
    AdminController.saveSertifies(req, res);
});

adminRouter.post("/sertifies/:id", uploadPhoto, csrfMiddleware, (req, res) => {
    AdminController.saveSertifies(req, res);
});

adminRouter.post("/sertifies/:id/delete", csrfMiddleware, (req, res) => {
    AdminController.deleteSertifies(req, res);
});

adminRouter.get("/skills", csrfMiddleware, (req, res) => {
    AdminController.getSkills(req, res);
});

adminRouter.get("/skills/new", csrfMiddleware, (req, res) => {
    AdminController.getSkillForm(req, res);
});

adminRouter.get("/skills/:id/edit", csrfMiddleware, (req, res) => {
    AdminController.getSkillForm(req, res);
});

adminRouter.post("/skills/new", csrfMiddleware, (req, res) => {
    AdminController.saveSkill(req, res);
});

adminRouter.post("/skills/:id", csrfMiddleware, (req, res) => {
    AdminController.saveSkill(req, res);
});

adminRouter.post("/skills/:id/delete", csrfMiddleware, (req, res) => {
    AdminController.deleteSkill(req, res);
});

adminRouter.get("/social", csrfMiddleware, (req, res) => {
    AdminController.getSocial(req, res);
});

adminRouter.get("/social/new", csrfMiddleware, (req, res) => {
    AdminController.getSocialForm(req, res);
});

adminRouter.get("/social/:id/edit", csrfMiddleware, (req, res) => {
    AdminController.getSocialForm(req, res);
});

adminRouter.post("/social/new", uploadPhoto, csrfMiddleware, (req, res) => {
    AdminController.saveSocial(req, res);
});

adminRouter.post("/social/:id", uploadPhoto, csrfMiddleware, (req, res) => {
    AdminController.saveSocial(req, res);
});

adminRouter.post("/social/:id/delete", csrfMiddleware, (req, res) => {
    AdminController.deleteSocial(req, res);
});

adminRouter.get("/auth-log", csrfMiddleware, (req, res) => {
    AdminController.getAuthLog(req, res);
});

module.exports = adminRouter;
