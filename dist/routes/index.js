"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Route to get all invoices
router.get('/invoices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invoices = yield prisma.invoice.findMany();
    res.json(invoices);
}));
// Route to download an invoice
router.get('/invoices/download/:fileName', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    const fileName = req.params.fileName;
    const baseDir = path_1.default.join(__dirname, '../faturas');
    console.log(`Base directory: ${baseDir}`);
    console.log(`File requested: ${fileName}`);
    const findFileInSubdirectories = (dir, file, depth = 0) => {
        if (depth > 10) {
            console.error(`Reached max directory depth at ${dir}`);
            return null;
        }
        try {
            console.log(`Searching in directory: ${dir}`);
            const files = fs_1.default.readdirSync(dir);
            for (const fileOrDir of files) {
                const fullPath = path_1.default.join(dir, fileOrDir);
                console.log(`Checking path: ${fullPath}`);
                if (fs_1.default.lstatSync(fullPath).isDirectory()) {
                    const found = findFileInSubdirectories(fullPath, file, depth + 1);
                    if (found)
                        return found;
                }
                else if (fileOrDir === file) {
                    console.log(`File found: ${fullPath}`);
                    return fullPath;
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
            return null;
        }
        return null;
    };
    if (!fs_1.default.existsSync(baseDir)) {
        console.error(`Base directory ${baseDir} not found`);
        return res.status(404).send('Base directory not found');
    }
    const filePath = findFileInSubdirectories(baseDir, fileName);
    console.log(`File path found: ${filePath}`);
    if (filePath) {
        res.download(filePath, (err) => {
            if (err) {
                console.error(`Error during file download: ${err}`);
            }
        });
    }
    else {
        console.error(`File not found: ${fileName}`);
        res.status(404).send('File not found');
    }
});
exports.default = router;
