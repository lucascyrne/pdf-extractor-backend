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
const storage_1 = require("@google-cloud/storage");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const storage = new storage_1.Storage();
// Route to get all invoices
router.get('/invoices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invoices = yield prisma.invoice.findMany();
    res.json(invoices);
}));
// Helper function to find file in subdirectories locally
const findFileInSubdirectoriesLocal = (dir, file) => {
    const items = fs_1.default.readdirSync(dir);
    for (const item of items) {
        const fullPath = path_1.default.join(dir, item);
        if (fs_1.default.lstatSync(fullPath).isDirectory()) {
            const found = findFileInSubdirectoriesLocal(fullPath, file);
            if (found) {
                return found;
            }
        }
        else if (item === file) {
            return fullPath;
        }
    }
    return null;
};
// Helper function to find file in subdirectories in GCS
const findFileInSubdirectoriesGCS = (bucketName, prefix, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const [files] = yield storage.bucket(bucketName).getFiles({ prefix });
    for (const file of files) {
        if (file.name.endsWith(fileName)) {
            return file.name;
        }
    }
    return null;
});
// Route to download an invoice
router.get('/invoices/download/:fileName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.params.fileName;
    if (process.env.NODE_ENV === 'production') {
        const bucketName = 'YOUR_BUCKET_NAME';
        const prefix = 'faturas/';
        console.log(`Attempting to download file: ${fileName} from bucket: ${bucketName} with prefix: ${prefix}`);
        try {
            const filePath = yield findFileInSubdirectoriesGCS(bucketName, prefix, fileName);
            if (!filePath) {
                console.error(`File not found: ${fileName}`);
                return res.status(404).send('File not found');
            }
            const file = storage.bucket(bucketName).file(filePath);
            const readStream = file.createReadStream();
            readStream.on('error', (err) => {
                console.error(`Error reading file: ${err}`);
                return res.status(500).send('Error reading file');
            });
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            readStream.pipe(res);
        }
        catch (error) {
            console.error(`Error downloading file: ${error}`);
            res.status(500).send('Error downloading file');
        }
    }
    else {
        const baseDir = path_1.default.join(__dirname, '../faturas');
        console.log(`Base directory: ${baseDir}`);
        console.log(`File requested: ${fileName}`);
        if (!fs_1.default.existsSync(baseDir)) {
            console.error(`Base directory ${baseDir} not found`);
            return res.status(404).send('Base directory not found');
        }
        const filePath = findFileInSubdirectoriesLocal(baseDir, fileName);
        console.log(`File path found: ${filePath}`);
        if (filePath) {
            res.download(filePath, (err) => {
                if (err) {
                    console.error(`Error during file download: ${err}`);
                    return res.status(500).send('Error during file download');
                }
            });
        }
        else {
            console.error(`File not found: ${fileName}`);
            res.status(404).send('File not found');
        }
    }
}));
exports.default = router;
