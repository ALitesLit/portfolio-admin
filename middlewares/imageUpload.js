const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
        fields: 10,
        parts: 12,
        fieldNameSize: 100,
        fieldSize: 1024 * 1024,
        fieldArrayIndexLimit: 10
    },
    fileFilter: (req, file, cb) => {
        const extension = file.originalname
            .toLowerCase()
            .split(".")
            .pop();

        if (!["png", "svg"].includes(extension)) {
            return cb(new Error("Разрешены только PNG и SVG"));
        }

        if (!["image/png", "image/svg+xml", "application/svg+xml"].includes(file.mimetype)) {
            return cb(new Error("Недопустимый тип изображения"));
        }

        cb(null, true);
    }
});

const uploadPhoto = upload.single("photo");

module.exports = {
    uploadPhoto
};
