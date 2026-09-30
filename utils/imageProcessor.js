const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const STATIC_DIR = process.env.STATIC_DIR ||
    path.resolve(__dirname, "../../portfolio-back/static");

function getExtension(file) {
    return file.originalname
        .toLowerCase()
        .split(".")
        .pop();
}

function isPng(buffer) {
    return buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a;
}

function isSvg(buffer) {
    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 1024 * 1024));
    return /^\uFEFF?\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text);
}

function validateSvg(buffer) {
    if (buffer.includes(Buffer.from([0x00]))) {
        throw new Error("SVG содержит недопустимые бинарные данные");
    }

    const svg = buffer.toString("utf8");

    if (!/<svg[\s>]/i.test(svg)) {
        throw new Error("Некорректный SVG");
    }

    if (/<!DOCTYPE/i.test(svg)) {
        throw new Error("SVG с DOCTYPE запрещён");
    }

    if (/<!ENTITY/i.test(svg)) {
        throw new Error("SVG с ENTITY запрещён");
    }

    if (/<script[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый script");
    }

    if (/<foreignObject[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый foreignObject");
    }

    if (/<iframe[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый iframe");
    }

    if (/<object[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый object");
    }

    if (/<embed[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый embed");
    }

    if (/<audio[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый audio");
    }

    if (/<video[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый video");
    }

    if (/<link[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый link");
    }

    if (/<style[\s>]/i.test(svg)) {
        throw new Error("SVG содержит запрещённый style");
    }

    if (/\son[a-z]+\s*=/i.test(svg)) {
        throw new Error("SVG содержит обработчик событий");
    }

    if (/javascript\s*:/i.test(svg)) {
        throw new Error("SVG содержит javascript");
    }

    if (/vbscript\s*:/i.test(svg)) {
        throw new Error("SVG содержит vbscript");
    }

    if (/data\s*:\s*text\/html/i.test(svg)) {
        throw new Error("SVG содержит встроенный HTML");
    }

    if (/url\s*\(\s*https?:/i.test(svg)) {
        throw new Error("SVG содержит внешний ресурс");
    }

    if (/url\s*\(\s*\/\//i.test(svg)) {
        throw new Error("SVG содержит внешний ресурс");
    }

    if (/(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/|javascript:|data:)/i.test(svg)) {
        throw new Error("SVG содержит внешний ресурс");
    }

    if (/<image[^>]+(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/)/i.test(svg)) {
        throw new Error("SVG содержит внешний ресурс");
    }

    if (!/^.{0,1000}<svg[\s>]/is.test(svg)) {
        throw new Error("Некорректная структура SVG");
    }

    return svg
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .trim();
}

async function validateImage(buffer, extension) {
    if (!buffer || buffer.length === 0) {
        throw new Error("Файл пустой");
    }

    if (buffer.length > MAX_FILE_SIZE) {
        throw new Error("Размер изображения не должен превышать 5 МБ");
    }

    if (extension === "png") {
        if (!isPng(buffer)) {
            throw new Error("Файл не является корректным PNG");
        }
    }

    if (extension === "svg") {
        validateSvg(buffer);
    }

    const input = extension === "svg"
        ? Buffer.from(validateSvg(buffer))
        : buffer;

    try {
        return await sharp(input, {
            failOn: "warning",
            limitInputPixels: 3508 * 2481,
            limitInputChannels: 4,
            sequentialRead: true
        }).metadata();
    } catch (err) {
        throw new Error("Изображение повреждено или имеет небезопасную структуру");
    }
}

async function createPng(input, width, height) {
    const pipeline = sharp(input, {
        failOn: "warning",
        limitInputPixels: 3508 * 2481,
        limitInputChannels: 4,
        sequentialRead: true
    })
        .rotate()
        .resize(width, height, {
            fit: "inside",
            withoutEnlargement: true
        });

    const variants = [
        {
            compressionLevel: 9,
            adaptiveFiltering: true
        },
        {
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true,
            quality: 90,
            effort: 10,
            colours: 256
        },
        {
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true,
            quality: 85,
            effort: 10,
            colours: 128
        },
        {
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true,
            quality: 80,
            effort: 10,
            colours: 64
        },
        {
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true,
            quality: 75,
            effort: 10,
            colours: 32
        }
    ];

    for (const options of variants) {
        const result = await pipeline
            .png(options)
            .toBuffer();

        if (result.length <= MAX_FILE_SIZE) {
            return result;
        }
    }

    throw new Error("После сжатия изображение всё ещё превышает 5 МБ");
}

async function saveImage(file, directory, maxWidth, maxHeight) {
    const extension = getExtension(file);

    if (!["png", "svg"].includes(extension)) {
        throw new Error("Разрешены только PNG и SVG");
    }

    const metadata = await validateImage(file.buffer, extension);

    if (!metadata.width || !metadata.height) {
        throw new Error("Не удалось определить размеры изображения");
    }

    const input = extension === "svg"
        ? Buffer.from(validateSvg(file.buffer))
        : file.buffer;

    const output = await createPng(
        input,
        maxWidth,
        maxHeight
    );

    const folder = path.join(STATIC_DIR, directory);

    await fs.mkdir(folder, {
        recursive: true
    });

    const filename = `${crypto.randomUUID()}.png`;
    const filepath = path.join(folder, filename);

    await fs.writeFile(filepath, output, {
        flag: "wx",
        mode: 0o640
    });

    return `/static/${directory}/${filename}`;
}

async function deleteImage(imagePath) {
    if (!imagePath || !imagePath.startsWith("/static/")) {
        return;
    }

    const relativePath = imagePath.slice("/static/".length);
    const filepath = path.resolve(STATIC_DIR, relativePath);
    const staticRoot = path.resolve(STATIC_DIR);

    if (!filepath.startsWith(`${staticRoot}${path.sep}`)) {
        return;
    }

    try {
        await fs.unlink(filepath);
    } catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
}

module.exports = {
    saveImage,
    deleteImage
};
