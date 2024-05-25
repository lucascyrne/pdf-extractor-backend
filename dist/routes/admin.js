"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/admin.ts
const express_1 = require("express");
const child_process_1 = require("child_process");
const adminRouter = (0, express_1.Router)();
adminRouter.post('/migrate', (req, res) => {
    (0, child_process_1.exec)('npx prisma migrate deploy', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send(`exec error: ${error}`);
            return;
        }
        res.send(`stdout: ${stdout}\nstderr: ${stderr}`);
    });
});
adminRouter.post('/process-invoices', (req, res) => {
    (0, child_process_1.exec)('npx ts-node src/utils/extractAndStore.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send(`exec error: ${error}`);
            return;
        }
        res.send(`stdout: ${stdout}\nstderr: ${stderr}`);
    });
});
exports.default = adminRouter;
